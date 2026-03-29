import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../common/audit-log.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ListUsersDto,
  UpdateUserDto,
  ResolveDisputeDto,
  ReviewReportDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // ── Users ──

  async listUsers(dto: ListUsersDto) {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (dto.search) {
      where.OR = [
        { email: { contains: dto.search, mode: 'insensitive' } },
        { studentProfile: { firstName: { contains: dto.search, mode: 'insensitive' } } },
        { studentProfile: { lastName: { contains: dto.search, mode: 'insensitive' } } },
        { employerProfile: { companyName: { contains: dto.search, mode: 'insensitive' } } },
      ];
    }

    if (dto.role) {
      where.role = dto.role;
    }

    if (dto.status === 'suspended') {
      where.isSuspended = true;
    } else if (dto.status === 'active') {
      where.isActive = true;
      where.isSuspended = false;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isSuspended: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          studentProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              university: true,
              ratingAvg: true,
              gigsCompleted: true,
              totalEarned: true,
            },
          },
          employerProfile: {
            select: {
              id: true,
              businessName: true,
              contactPerson: true,
              ratingAvg: true,
              totalSpent: true,
              gigsPosted: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUser(userId: string, adminId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const update: any = {};

    if (dto.suspend) {
      update.isSuspended = true;
    }
    if (dto.activate) {
      update.isSuspended = false;
      update.isActive = true;
    }
    if (dto.role && ['student', 'employer', 'admin'].includes(dto.role)) {
      update.role = dto.role;
    }

    const result = await this.prisma.user.update({
      where: { id: userId },
      data: update,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isSuspended: true,
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: userId,
      details: { changes: update, targetEmail: user.email },
    });

    return result;
  }

  // ── Disputes ──

  async listDisputes(params: { status?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: {
            select: { id: true, title: true, status: true, agreedRate: true },
          },
          raisedBy: {
            select: { id: true, email: true, role: true },
          },
          resolvedBy: {
            select: { id: true, email: true },
          },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async resolveDispute(disputeId: string, adminId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            student: { select: { id: true, userId: true } },
            employer: { select: { id: true, userId: true } },
          },
        },
        milestone: true,
        serviceOrder: true,
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status !== 'open' && dispute.status !== 'under_review') {
      throw new BadRequestException('Dispute is already resolved');
    }

    const validResolutions = ['resolved_student', 'resolved_employer', 'resolved_split'];
    if (!validResolutions.includes(dto.resolution)) {
      throw new BadRequestException('Invalid resolution. Must be: resolved_student, resolved_employer, or resolved_split');
    }

    if (dto.resolution === 'resolved_split' && !dto.splitPercentage) {
      throw new BadRequestException('splitPercentage (1–99) is required for resolved_split');
    }

    // Find the escrowed payment for this milestone or service order
    const escrowWhere: any = {
      status: 'escrow',
      contractId: dispute.contractId,
    };
    if (dispute.milestoneId) escrowWhere.milestoneId = dispute.milestoneId;
    else if (dispute.serviceOrderId) escrowWhere.serviceOrderId = dispute.serviceOrderId;

    const escrowPayment = await this.prisma.payment.findFirst({ where: escrowWhere });
    const escrowAmount = escrowPayment ? Number(escrowPayment.amount) : 0;

    let refundAmount = 0;
    let releaseAmount = 0;

    // ── Execute financial resolution ──
    if (escrowPayment && escrowAmount > 0) {
      switch (dto.resolution) {
        case 'resolved_student':
          // Full release to student (via normal escrow release flow)
          releaseAmount = escrowAmount;
          if (dispute.milestoneId) {
            await this.paymentsService.releaseMilestonePayment(dispute.milestoneId);
          } else {
            await this.releaseEscrowToStudent(escrowPayment, dispute);
          }
          break;

        case 'resolved_employer':
          // Full refund to employer
          refundAmount = escrowAmount;
          await this.refundEscrowToEmployer(escrowPayment, dispute);
          break;

        case 'resolved_split': {
          // Partial split
          const pct = dto.splitPercentage!;
          const studentPortion = Math.round(escrowAmount * (pct / 100) * 100) / 100;
          const employerPortion = Math.round((escrowAmount - studentPortion) * 100) / 100;
          releaseAmount = studentPortion;
          refundAmount = employerPortion;
          await this.splitEscrow(escrowPayment, dispute, studentPortion, employerPortion);
          break;
        }
      }
    }

    // Update dispute record
    const result = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: dto.resolution as any,
        adminNotes: dto.adminNotes,
        splitPercentage: dto.splitPercentage || null,
        refundAmount: refundAmount || null,
        releaseAmount: releaseAmount || null,
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    // Notify both parties
    const contract = dispute.contract;
    for (const uid of [contract.student.userId, contract.employer.userId]) {
      this.notificationsService.create({
        userId: uid,
        type: 'dispute_resolved',
        title: 'Dispute Resolved',
        body: `The dispute on "${contract.title}" has been resolved by admin.`,
        data: { disputeId, resolution: dto.resolution },
      }).catch(() => {});
    }

    await this.auditLog.log({
      userId: adminId,
      action: 'RESOLVE_DISPUTE',
      entity: 'Dispute',
      entityId: disputeId,
      details: {
        resolution: dto.resolution,
        contractId: dispute.contractId,
        escrowAmount,
        refundAmount,
        releaseAmount,
        splitPercentage: dto.splitPercentage,
      },
    });

    this.logger.log(
      `Dispute ${disputeId} resolved: ${dto.resolution}, refund=GH₵${refundAmount}, release=GH₵${releaseAmount}`,
    );
    return result;
  }

  // ── Dispute Financial Helpers ──

  /**
   * Release escrowed money to the student (for service orders or when releaseMilestonePayment isn't suitable).
   */
  private async releaseEscrowToStudent(payment: any, dispute: any) {
    const amount = Number(payment.amount);
    const fees = await this.paymentsService.calculateFees(
      dispute.contract.studentId,
      dispute.contract.employerId,
      amount,
    );

    await this.prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'released',
          platformFee: fees.platformFee,
          feePercentage: fees.feePercentage * 100,
          netAmount: fees.netAmount,
          releasedAt: new Date(),
        },
      });

      // Update escrow transaction
      await tx.escrowTransaction.updateMany({
        where: {
          OR: [
            ...(dispute.milestoneId ? [{ milestoneId: dispute.milestoneId }] : []),
            ...(dispute.serviceOrderId ? [{ serviceOrderId: dispute.serviceOrderId }] : []),
          ],
          status: { in: ['funded', 'in_progress', 'submitted', 'disputed'] },
        },
        data: { status: 'released', releasedAt: new Date(), netAmount: fees.netAmount, platformFee: fees.platformFee },
      });

      // Credit student wallet
      const wallet = await this.getOrCreateWallet(tx, dispute.contract.student.userId);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: fees.netAmount },
          pendingBalance: { decrement: amount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'credit',
          amount: fees.netAmount,
          balanceAfter: Number(wallet.balance) + fees.netAmount,
          description: `Dispute resolved in your favor — GH₵${amount} (fee: GH₵${fees.platformFee.toFixed(2)})`,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'dispute_release',
          entityType: 'dispute',
          entityId: dispute.id,
          amount: fees.netAmount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance) + fees.netAmount,
          metadata: { grossAmount: amount, fee: fees.platformFee, paymentId: payment.id },
        },
      });
    });
  }

  /**
   * Refund escrowed money to the employer via Paystack Refund API.
   */
  private async refundEscrowToEmployer(payment: any, dispute: any) {
    const amount = Number(payment.amount);

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'refunded', platformFee: 0, netAmount: 0 },
      });

      await tx.escrowTransaction.updateMany({
        where: {
          OR: [
            ...(dispute.milestoneId ? [{ milestoneId: dispute.milestoneId }] : []),
            ...(dispute.serviceOrderId ? [{ serviceOrderId: dispute.serviceOrderId }] : []),
          ],
          status: { in: ['funded', 'in_progress', 'submitted', 'disputed'] },
        },
        data: { status: 'refunded', refundedAt: new Date() },
      });

      // Decrement pending balance from student wallet
      const wallet = await tx.wallet.findFirst({
        where: { userId: dispute.contract.student.userId },
      });
      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { pendingBalance: { decrement: amount } },
        });
      }

      if (dispute.milestoneId) {
        await tx.milestone.update({
          where: { id: dispute.milestoneId },
          data: { status: 'cancelled' },
        });
      }

      await tx.financialAuditLog.create({
        data: {
          action: 'dispute_refund',
          entityType: 'dispute',
          entityId: dispute.id,
          amount,
          metadata: { paymentId: payment.id, externalTxnId: payment.externalTxnId },
        },
      });
    });

    // Initiate Paystack refund (async — don't block resolution)
    if (payment.externalTxnId) {
      this.paymentsService.initiateRefund({
        transactionReference: payment.externalTxnId,
        amount: amount * 100, // pesewas
      }).catch((err) => {
        this.logger.error(`Failed to initiate Paystack refund for dispute ${dispute.id}`, err);
      });
    }
  }

  /**
   * Split escrow: partial release to student + partial refund to employer.
   */
  private async splitEscrow(payment: any, dispute: any, studentAmount: number, employerAmount: number) {
    const totalAmount = Number(payment.amount);
    const fees = await this.paymentsService.calculateFees(
      dispute.contract.studentId,
      dispute.contract.employerId,
      studentAmount,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'partially_refunded',
          platformFee: fees.platformFee,
          feePercentage: fees.feePercentage * 100,
          netAmount: fees.netAmount,
          releasedAt: new Date(),
        },
      });

      await tx.escrowTransaction.updateMany({
        where: {
          OR: [
            ...(dispute.milestoneId ? [{ milestoneId: dispute.milestoneId }] : []),
            ...(dispute.serviceOrderId ? [{ serviceOrderId: dispute.serviceOrderId }] : []),
          ],
          status: { in: ['funded', 'in_progress', 'submitted', 'disputed'] },
        },
        data: {
          status: 'partially_refunded',
          netAmount: fees.netAmount,
          platformFee: fees.platformFee,
          releasedAt: new Date(),
        },
      });

      // Credit student wallet (student's portion minus fee)
      const wallet = await this.getOrCreateWallet(tx, dispute.contract.student.userId);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: fees.netAmount },
          pendingBalance: { decrement: totalAmount },
        },
      });

      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'credit',
          amount: fees.netAmount,
          balanceAfter: Number(wallet.balance) + fees.netAmount,
          description: `Dispute split — GH₵${studentAmount} your portion (fee: GH₵${fees.platformFee.toFixed(2)}), GH₵${employerAmount} refunded`,
        },
      });

      await tx.financialAuditLog.create({
        data: {
          action: 'dispute_split',
          entityType: 'dispute',
          entityId: dispute.id,
          amount: fees.netAmount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance) + fees.netAmount,
          metadata: {
            totalAmount,
            studentPortion: studentAmount,
            employerPortion: employerAmount,
            platformFee: fees.platformFee,
            paymentId: payment.id,
          },
        },
      });
    });

    // Initiate partial Paystack refund for employer's portion
    if (payment.externalTxnId && employerAmount > 0) {
      this.paymentsService.initiateRefund({
        transactionReference: payment.externalTxnId,
        amount: employerAmount * 100, // pesewas
      }).catch((err) => {
        this.logger.error(`Failed to initiate partial refund for dispute ${dispute.id}`, err);
      });
    }
  }

  private async getOrCreateWallet(tx: any, userId: string) {
    let wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId, balance: 0, pendingBalance: 0 },
      });
    }
    return wallet;
  }

  // ── Reports ──

  async listReports(params: { status?: string; entity?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.entity) {
      where.reportedEntity = params.entity;
    }

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async reviewReport(reportId: string, adminId: string, dto: ReviewReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const validStatuses = ['reviewed', 'action_taken', 'dismissed'];
    if (!validStatuses.includes(dto.status)) {
      throw new BadRequestException('Invalid status. Must be: reviewed, action_taken, or dismissed');
    }

    const result = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: dto.status as any,
        adminNotes: dto.adminNotes,
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: 'REVIEW_REPORT',
      entity: 'Report',
      entityId: reportId,
      details: { newStatus: dto.status, reportedEntity: report.reportedEntity },
    });

    return result;
  }

  // ── Community Moderation ──

  async hideCommunityPost(postId: string, adminId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    await this.auditLog.log({
      userId: adminId,
      action: 'HIDE_COMMUNITY_POST',
      entity: 'CommunityPost',
      entityId: postId,
      details: { authorId: post.authorId },
    });

    return { hidden: true };
  }

  async deleteCommunityPost(postId: string, adminId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    await this.prisma.communityPost.delete({ where: { id: postId } });

    await this.auditLog.log({
      userId: adminId,
      action: 'DELETE_COMMUNITY_POST',
      entity: 'CommunityPost',
      entityId: postId,
      details: { authorId: post.authorId, content: post.content.slice(0, 200) },
    });

    return { deleted: true };
  }

  async deleteCommunityComment(commentId: string, adminId: string) {
    const comment = await this.prisma.communityComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    await this.prisma.$transaction([
      this.prisma.communityComment.update({
        where: { id: commentId },
        data: { isDeleted: true },
      }),
      this.prisma.communityPost.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    await this.auditLog.log({
      userId: adminId,
      action: 'DELETE_COMMUNITY_COMMENT',
      entity: 'CommunityComment',
      entityId: commentId,
      details: { authorId: comment.authorId, postId: comment.postId },
    });

    return { deleted: true };
  }

  // ── Stats ──

  async getStats() {
    const cacheKey = 'admin:stats';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const [
      totalUsers,
      totalStudents,
      totalEmployers,
      totalGigs,
      openGigs,
      totalContracts,
      activeContracts,
      completedContracts,
      openDisputes,
      pendingReports,
      totalPayments,
      totalRevenue,
      communityPosts,
      communityComments,
      communityLikes,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'employer' } }),
      this.prisma.gig.count(),
      this.prisma.gig.count({ where: { status: 'open' } }),
      this.prisma.contract.count(),
      this.prisma.contract.count({ where: { status: 'active' } }),
      this.prisma.contract.count({ where: { status: 'completed' } }),
      this.prisma.dispute.count({ where: { status: 'open' } }),
      this.prisma.report.count({ where: { status: 'pending' } }),
      this.prisma.payment.count(),
      this.prisma.payment.aggregate({ _sum: { platformFee: true } }),
      this.prisma.communityPost.count({ where: { isDeleted: false } }),
      this.prisma.communityComment.count({ where: { isDeleted: false } }),
      this.prisma.communityLike.count(),
    ]);

    // Recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignups = await this.prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const totalEscrow = await this.prisma.payment.aggregate({
      where: { status: 'escrow' },
      _sum: { amount: true },
    });

    const totalReleased = await this.prisma.payment.aggregate({
      where: { status: 'released' },
      _sum: { amount: true },
    });

    const result = {
      users: { total: totalUsers, students: totalStudents, employers: totalEmployers, recentSignups },
      gigs: { total: totalGigs, open: openGigs },
      contracts: { total: totalContracts, active: activeContracts, completed: completedContracts },
      disputes: { open: openDisputes },
      reports: { pending: pendingReports },
      financial: {
        totalPayments,
        platformFees: Number(totalRevenue._sum.platformFee || 0),
        escrowHeld: Number(totalEscrow._sum.amount || 0),
        totalReleased: Number(totalReleased._sum.amount || 0),
      },
      community: {
        posts: communityPosts,
        comments: communityComments,
        likes: communityLikes,
      },
    };

    await this.cache.set(cacheKey, result, 120_000); // 2 minutes
    return result;
  }

  // ── Categories ──

  async createCategory(adminId: string, dto: CreateCategoryDto) {
    const result = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        icon: dto.icon,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: 'CREATE_CATEGORY',
      entity: 'Category',
      entityId: result.id,
      details: { name: dto.name, slug: dto.slug },
    });

    return result;
  }

  async updateCategory(id: string, adminId: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');

    const result = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.auditLog.log({
      userId: adminId,
      action: 'UPDATE_CATEGORY',
      entity: 'Category',
      entityId: id,
      details: { previousName: cat.name, changes: dto as Record<string, unknown> },
    });

    return result;
  }

  async deleteCategory(id: string, adminId: string) {
    const cat = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { gigs: true } } },
    });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat._count.gigs > 0) {
      throw new BadRequestException(`Cannot delete category with ${cat._count.gigs} gigs. Deactivate instead.`);
    }

    await this.prisma.category.delete({ where: { id } });

    await this.auditLog.log({
      userId: adminId,
      action: 'DELETE_CATEGORY',
      entity: 'Category',
      entityId: id,
      details: { deletedName: cat.name, deletedSlug: cat.slug },
    });

    return { deleted: true };
  }

  async listCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { gigs: true } },
      },
    });
  }
}
