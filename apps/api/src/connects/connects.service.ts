import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectsService {
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
        freeConnects: 10,
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

  // ── Deduct connects on proposal submission ──

  async deductForProposal(userId: string, gigId: string, cost: number = 2) {
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
          description: `Spent ${cost} connects on proposal`,
        },
      });
    });
  }

  // ── Refund connects on declined proposal ──

  async refundForProposal(userId: string, gigId: string, amount: number = 2) {
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
          freeConnects: 10 + amount,
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
          description: `Refunded ${amount} connects (proposal declined)`,
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
          freeConnects: 10, // fresh monthly grant
          lastRefreshAt: new Date(),
        },
      });

      const totalAfter = 10 + balance.purchasedConnects + newRollover;

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
          amount: 10,
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
}
