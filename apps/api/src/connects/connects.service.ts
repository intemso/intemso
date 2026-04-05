import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectsService {
  private readonly logger = new Logger(ConnectsService.name);

  constructor(private prisma: PrismaService) {}

  // ── Get connect balance ──

  async getBalance(userId: string) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const balance = await this.prisma.connectBalance.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        freeConnects: 15,
        purchasedConnects: 0,
        rolloverConnects: 0,
      },
    });

    return {
      free: balance.freeConnects,
      purchased: balance.purchasedConnects,
      rollover: balance.rolloverConnects,
      total: balance.freeConnects + balance.purchasedConnects + balance.rolloverConnects,
      lastRefreshAt: balance.lastRefreshAt,
    };
  }

  // ── Deduct connects on application submission ──

  async deductForApplication(userId: string, gigId: string, cost: number = 1) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const balance = await this.prisma.connectBalance.findUnique({
      where: { studentId: student.id },
    });

    const total = (balance?.freeConnects ?? 0) + (balance?.purchasedConnects ?? 0) + (balance?.rolloverConnects ?? 0);
    if (total < cost) {
      throw new BadRequestException(`Not enough connects. You need ${cost} but have ${total}.`);
    }

    // Deduct in order: free → rollover → purchased
    let remaining = cost;
    let freeDeduct = 0;
    let rolloverDeduct = 0;
    let purchasedDeduct = 0;

    if (balance) {
      freeDeduct = Math.min(remaining, balance.freeConnects);
      remaining -= freeDeduct;

      if (remaining > 0) {
        rolloverDeduct = Math.min(remaining, balance.rolloverConnects);
        remaining -= rolloverDeduct;
      }

      if (remaining > 0) {
        purchasedDeduct = Math.min(remaining, balance.purchasedConnects);
        remaining -= purchasedDeduct;
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.connectBalance.update({
        where: { studentId: student.id },
        data: {
          freeConnects: { decrement: freeDeduct },
          rolloverConnects: { decrement: rolloverDeduct },
          purchasedConnects: { decrement: purchasedDeduct },
        },
      });

      const updatedBalance = await tx.connectBalance.findUnique({
        where: { studentId: student.id },
      });
      const totalAfter = (updatedBalance?.freeConnects ?? 0) +
        (updatedBalance?.purchasedConnects ?? 0) +
        (updatedBalance?.rolloverConnects ?? 0);

      await tx.connectTransaction.create({
        data: {
          studentId: student.id,
          type: 'proposal_spent',
          amount: -cost,
          balanceAfter: totalAfter,
          referenceId: gigId,
          description: `Spent ${cost} connect on application`,
        },
      });
    });
  }

  // ── Refund connects on declined application ──

  async refundForApplication(userId: string, gigId: string, amount: number = 1) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.connectBalance.upsert({
        where: { studentId: student.id },
        update: { freeConnects: { increment: amount } },
        create: {
          studentId: student.id,
          freeConnects: 15 + amount,
          purchasedConnects: 0,
          rolloverConnects: 0,
        },
      });

      const balance = await tx.connectBalance.findUnique({
        where: { studentId: student.id },
      });
      const totalAfter = (balance?.freeConnects ?? 0) +
        (balance?.purchasedConnects ?? 0) +
        (balance?.rolloverConnects ?? 0);

      await tx.connectTransaction.create({
        data: {
          studentId: student.id,
          type: 'proposal_refund',
          amount,
          balanceAfter: totalAfter,
          referenceId: gigId,
          description: `Refunded ${amount} connect (application declined)`,
        },
      });
    });
  }

  // ── Monthly free grant + rollover ──

  async processMonthlyGrant(studentId: string) {
    const MAX_ROLLOVER = 80;

    return this.prisma.$transaction(async (tx) => {
      const balance = await tx.connectBalance.findUnique({
        where: { studentId },
      });
      if (!balance) return;

      // Unused free connects → rollover (capped)
      const rolloverAdd = balance.freeConnects;
      const newRollover = Math.min(balance.rolloverConnects + rolloverAdd, MAX_ROLLOVER);

      await tx.connectBalance.update({
        where: { studentId },
        data: {
          rolloverConnects: newRollover,
          freeConnects: 15, // fresh monthly grant
          lastRefreshAt: new Date(),
        },
      });

      const totalAfter = 15 + balance.purchasedConnects + newRollover;

      // Log rollover
      if (rolloverAdd > 0) {
        await tx.connectTransaction.create({
          data: {
            studentId,
            type: 'rollover',
            amount: newRollover - balance.rolloverConnects,
            balanceAfter: totalAfter,
            description: `Rolled over ${rolloverAdd} unused free connects`,
          },
        });
      }

      // Log monthly grant
      await tx.connectTransaction.create({
        data: {
          studentId,
          type: 'monthly_grant',
          amount: 15,
          balanceAfter: totalAfter,
          description: 'Monthly free connects grant',
        },
      });
    });
  }

  // ── Connect transaction history ──

  async getTransactions(userId: string, params: { page?: number; limit?: number }) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) {
      return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.connectTransaction.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.connectTransaction.count({ where: { studentId: student.id } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Earned connects: award for activity ──

  async awardConnects(
    studentProfileId: string,
    amount: number,
    type: string,
    description: string,
    referenceId?: string,
  ) {
    // Idempotency: prevent duplicate rewards for same action
    if (referenceId) {
      const existing = await this.prisma.connectTransaction.findFirst({
        where: {
          studentId: studentProfileId,
          type: type as any,
          referenceId,
        },
      });
      if (existing) return null;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.connectBalance.upsert({
        where: { studentId: studentProfileId },
        update: { freeConnects: { increment: amount } },
        create: {
          studentId: studentProfileId,
          freeConnects: 15 + amount,
          purchasedConnects: 0,
          rolloverConnects: 0,
        },
      });

      const balance = await tx.connectBalance.findUnique({
        where: { studentId: studentProfileId },
      });
      const totalAfter = (balance?.freeConnects ?? 0) +
        (balance?.purchasedConnects ?? 0) +
        (balance?.rolloverConnects ?? 0);

      await tx.connectTransaction.create({
        data: {
          studentId: studentProfileId,
          type: type as any,
          amount,
          balanceAfter: totalAfter,
          referenceId,
          description,
        },
      });

      return { awarded: amount, totalAfter };
    });
  }

  /**
   * Award 5 connects when a student completes a gig.
   */
  async rewardGigCompleted(studentProfileId: string, contractId: string) {
    return this.awardConnects(
      studentProfileId,
      5,
      'reward_gig_completed',
      'Earned 5 connects for completing a gig',
      contractId,
    );
  }

  /**
   * Award 1 connect when a student leaves a review.
   */
  async rewardReviewLeft(studentProfileId: string, reviewId: string) {
    return this.awardConnects(
      studentProfileId,
      1,
      'reward_review_left',
      'Earned 1 connect for leaving a review',
      reviewId,
    );
  }

  /**
   * Award 3 connects when a student receives a 5-star review.
   */
  async rewardFiveStarReceived(studentProfileId: string, reviewId: string) {
    return this.awardConnects(
      studentProfileId,
      3,
      'reward_five_star',
      'Earned 3 connects for receiving a 5-star review',
      reviewId,
    );
  }

  /**
   * Award 10 connects when a student completes their profile (one-time).
   * Checks if already awarded to prevent duplicates.
   */
  async rewardProfileComplete(studentProfileId: string) {
    const existing = await this.prisma.connectTransaction.findFirst({
      where: {
        studentId: studentProfileId,
        type: 'reward_profile_complete',
      },
    });
    if (existing) return null; // already awarded

    return this.awardConnects(
      studentProfileId,
      10,
      'reward_profile_complete',
      'Earned 10 connects for completing your profile',
    );
  }

  /**
   * Award 1 connect for daily login (max 5 per week).
   */
  async rewardDailyLogin(userId: string) {
    const student = await this.prisma.studentProfile.findFirst({
      where: { user: { id: userId } },
    });
    if (!student) return null;

    // Check how many daily login rewards this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const loginRewardsThisWeek = await this.prisma.connectTransaction.count({
      where: {
        studentId: student.id,
        type: 'reward_daily_login',
        createdAt: { gte: weekAgo },
      },
    });

    if (loginRewardsThisWeek >= 5) return null; // max 5/week

    // Check if already rewarded today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const alreadyToday = await this.prisma.connectTransaction.findFirst({
      where: {
        studentId: student.id,
        type: 'reward_daily_login',
        createdAt: { gte: todayStart },
      },
    });

    if (alreadyToday) return null;

    return this.awardConnects(
      student.id,
      1,
      'reward_daily_login',
      'Earned 1 connect for daily login',
    );
  }

  // ── Monthly connect refresh cron (1st of each month at midnight) ──

  @Cron('0 0 1 * *')
  async processMonthlyRefreshAll() {
    this.logger.log('Starting monthly connect refresh for all students...');

    const balances = await this.prisma.connectBalance.findMany({
      select: { studentId: true },
    });

    let processed = 0;
    let errors = 0;

    for (const { studentId } of balances) {
      try {
        await this.processMonthlyGrant(studentId);
        processed++;
      } catch (err) {
        errors++;
        this.logger.error(`Failed monthly grant for student ${studentId}:`, err);
      }
    }

    this.logger.log(`Monthly connect refresh complete: ${processed} processed, ${errors} errors`);
  }
}
