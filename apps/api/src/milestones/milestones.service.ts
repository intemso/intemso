import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';

@Injectable()
export class MilestonesService {
  private readonly logger = new Logger(MilestonesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Add a milestone to a contract.
   * Either party can add milestones to an active contract.
   */
  async create(userId: string, contractId: string, dto: CreateMilestoneDto) {
    const contract = await this.getContractAndVerifyAccess(userId, contractId);

    if (contract.status !== 'active') {
      throw new BadRequestException('Can only add milestones to active contracts');
    }

    // Get the next sort order
    const lastMilestone = await this.prisma.milestone.findFirst({
      where: { contractId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = dto.sortOrder ?? (lastMilestone ? lastMilestone.sortOrder + 1 : 0);

    return this.prisma.milestone.create({
      data: {
        contractId,
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        sortOrder,
      },
    });
  }

  /**
   * Student submits deliverables for a milestone.
   */
  async submit(userId: string, milestoneId: string, dto: SubmitMilestoneDto) {
    const milestone = await this.getMilestoneWithContract(milestoneId);

    // Only the student can submit
    if (milestone.contract.student.userId !== userId) {
      throw new ForbiddenException('Only the student can submit milestone deliverables');
    }

    if (!['pending', 'funded', 'in_progress', 'revision_requested'].includes(milestone.status)) {
      throw new BadRequestException(`Cannot submit a milestone with status: ${milestone.status}`);
    }

    // Set auto-approve date (14 days from now)
    const autoApproveAt = new Date();
    autoApproveAt.setDate(autoApproveAt.getDate() + 14);

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'submitted',
        deliverables: dto.deliverables ?? [],
        submittedAt: new Date(),
        autoApproveAt,
      },
    }).then((result) => {
      // Notify employer about submission
      this.notificationsService.create({
        userId: milestone.contract.employer.userId,
        type: 'milestone_submitted',
        title: 'Milestone Submitted',
        body: `${milestone.contract.student.firstName} submitted deliverables for "${milestone.title}"`,
        data: { milestoneId, contractId: milestone.contractId },
      }).catch(() => {});
      return result;
    });
  }

  /**
   * Employer approves a submitted milestone.
   */
  async approve(userId: string, milestoneId: string) {
    const milestone = await this.getMilestoneWithContract(milestoneId);

    // Only the employer can approve
    if (milestone.contract.employer.userId !== userId) {
      throw new ForbiddenException('Only the employer can approve milestones');
    }

    if (milestone.status !== 'submitted') {
      throw new BadRequestException('Can only approve submitted milestones');
    }

    const result = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        autoApproveAt: null,
      },
    });

    // Notify student about approval
    this.notificationsService.create({
      userId: milestone.contract.student.userId,
      type: 'milestone_approved',
      title: 'Milestone Approved',
      body: `"${milestone.title}" has been approved! Payment is being released.`,
      data: { milestoneId, contractId: milestone.contractId },
    }).catch(() => {});

    // Release escrow payment if funded
    await this.paymentsService.releaseMilestonePayment(milestoneId).catch(() => {});

    return result;
  }

  /**
   * Employer requests revision on a submitted milestone.
   */
  async requestRevision(userId: string, milestoneId: string, dto: RequestRevisionDto) {
    const milestone = await this.getMilestoneWithContract(milestoneId);

    // Only the employer can request revision
    if (milestone.contract.employer.userId !== userId) {
      throw new ForbiddenException('Only the employer can request revisions');
    }

    if (milestone.status !== 'submitted') {
      throw new BadRequestException('Can only request revision on submitted milestones');
    }

    if (milestone.revisionCount >= milestone.maxRevisions) {
      throw new BadRequestException(
        `Maximum revisions (${milestone.maxRevisions}) reached. Please approve or raise a dispute.`,
      );
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'revision_requested',
        revisionCount: { increment: 1 },
        submittedAt: null,
        autoApproveAt: null,
      },
    }).then((result) => {
      // Notify student about revision request
      this.notificationsService.create({
        userId: milestone.contract.student.userId,
        type: 'milestone_revision',
        title: 'Revision Requested',
        body: `Revision requested for "${milestone.title}". Please update your deliverables.`,
        data: { milestoneId, contractId: milestone.contractId },
      }).catch(() => {});
      return result;
    });
  }

  // ── Helpers ──

  private async getContractAndVerifyAccess(userId: string, contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { userId: true } },
        employer: { select: { userId: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.student.userId !== userId && contract.employer.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  private async getMilestoneWithContract(milestoneId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        contract: {
          include: {
            student: { select: { userId: true, id: true, firstName: true, lastName: true } },
            employer: { select: { userId: true, id: true, businessName: true } },
          },
        },
      },
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    return milestone;
  }

  /**
   * Cron: auto-approve milestones past their 14-day window.
   * Runs every hour.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async autoApproveMilestones() {
    const overdue = await this.prisma.milestone.findMany({
      where: {
        status: 'submitted',
        autoApproveAt: { lte: new Date() },
      },
      include: {
        contract: {
          include: {
            student: { select: { userId: true } },
            employer: { select: { userId: true } },
          },
        },
      },
    });

    for (const milestone of overdue) {
      try {
        await this.prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: 'approved', approvedAt: new Date(), autoApproveAt: null },
        });

        await this.paymentsService.releaseMilestonePayment(milestone.id).catch(() => {});

        this.notificationsService.create({
          userId: milestone.contract.student.userId,
          type: 'milestone_approved',
          title: 'Milestone Auto-Approved',
          body: `"${milestone.title}" was automatically approved after 14 days.`,
          data: { milestoneId: milestone.id, contractId: milestone.contractId },
        }).catch(() => {});

        this.logger.log(`Auto-approved milestone ${milestone.id}`);
      } catch (err) {
        this.logger.error(`Failed to auto-approve milestone ${milestone.id}`, err);
      }
    }
  }
}
