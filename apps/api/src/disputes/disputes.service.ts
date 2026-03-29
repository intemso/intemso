import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateDisputeDto, RespondDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Either party opens a dispute on a contract (optionally on a specific milestone or service order).
   */
  async create(userId: string, dto: CreateDisputeDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
      include: {
        student: { select: { userId: true, id: true, firstName: true } },
        employer: { select: { userId: true, id: true, businessName: true } },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const isStudent = contract.student.userId === userId;
    const isEmployer = contract.employer.userId === userId;
    if (!isStudent && !isEmployer) {
      throw new ForbiddenException('Only contract parties can open a dispute');
    }

    // Check for existing open dispute on this contract
    const existingOpen = await this.prisma.dispute.findFirst({
      where: {
        contractId: dto.contractId,
        status: { in: ['open', 'under_review'] },
        ...(dto.milestoneId ? { milestoneId: dto.milestoneId } : {}),
        ...(dto.serviceOrderId ? { serviceOrderId: dto.serviceOrderId } : {}),
      },
    });
    if (existingOpen) {
      throw new BadRequestException('A dispute is already open for this item');
    }

    // Validate milestone belongs to this contract
    if (dto.milestoneId) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: dto.milestoneId },
      });
      if (!milestone || milestone.contractId !== dto.contractId) {
        throw new BadRequestException('Milestone does not belong to this contract');
      }
      // Milestone must be in a disputable state
      if (!['submitted', 'funded', 'in_progress', 'revision_requested'].includes(milestone.status)) {
        throw new BadRequestException(`Cannot dispute a milestone with status: ${milestone.status}`);
      }
    }

    // Validate service order
    if (dto.serviceOrderId) {
      const order = await this.prisma.serviceOrder.findUnique({
        where: { id: dto.serviceOrderId },
      });
      if (!order) throw new BadRequestException('Service order not found');
      if (!['active', 'delivered', 'revision_requested'].includes(order.status)) {
        throw new BadRequestException(`Cannot dispute a service order with status: ${order.status}`);
      }
    }

    // 72-hour response deadline
    const responseDeadline = new Date();
    responseDeadline.setHours(responseDeadline.getHours() + 72);

    const dispute = await this.prisma.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          contractId: dto.contractId,
          milestoneId: dto.milestoneId || null,
          serviceOrderId: dto.serviceOrderId || null,
          raisedById: userId,
          reason: dto.reason,
          description: dto.description,
          desiredResolution: dto.desiredResolution || null,
          evidence: dto.evidence || [],
          responseDeadline,
        },
      });

      // Mark contract as disputed
      await tx.contract.update({
        where: { id: dto.contractId },
        data: { status: 'disputed' },
      });

      // Mark milestone as disputed if applicable
      if (dto.milestoneId) {
        await tx.milestone.update({
          where: { id: dto.milestoneId },
          data: { status: 'disputed', autoApproveAt: null },
        });
      }

      // Mark service order as disputed if applicable
      if (dto.serviceOrderId) {
        await tx.serviceOrder.update({
          where: { id: dto.serviceOrderId },
          data: { status: 'disputed' },
        });
      }

      return created;
    });

    // Notify the other party
    const otherUserId = isStudent ? contract.employer.userId : contract.student.userId;
    this.notificationsService.create({
      userId: otherUserId,
      type: 'dispute_opened',
      title: 'Dispute Opened',
      body: `A dispute has been opened on contract "${contract.title}". You have 72 hours to respond.`,
      data: { disputeId: dispute.id, contractId: dto.contractId },
    }).catch(() => {});

    this.logger.log(`Dispute opened: ${dispute.id} on contract ${dto.contractId} by user ${userId}`);
    return dispute;
  }

  /**
   * The other party responds to a dispute within the 72-hour window.
   */
  async respond(userId: string, disputeId: string, dto: RespondDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            student: { select: { userId: true } },
            employer: { select: { userId: true } },
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (dispute.status !== 'open') {
      throw new BadRequestException('Can only respond to open disputes');
    }

    // Must be the OTHER party (not the one who raised it)
    if (dispute.raisedById === userId) {
      throw new BadRequestException('Cannot respond to your own dispute');
    }
    const isStudent = dispute.contract.student.userId === userId;
    const isEmployer = dispute.contract.employer.userId === userId;
    if (!isStudent && !isEmployer) {
      throw new ForbiddenException('Not a party to this dispute');
    }

    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'under_review',
        responseNote: dto.responseNote,
        responseEvidence: dto.responseEvidence || [],
        respondedAt: new Date(),
      },
    });

    // Notify the dispute raiser + admin
    this.notificationsService.create({
      userId: dispute.raisedById,
      type: 'dispute_response',
      title: 'Dispute Response Received',
      body: `The other party has responded to your dispute. An admin will review shortly.`,
      data: { disputeId },
    }).catch(() => {});

    this.logger.log(`Dispute ${disputeId} responded to by user ${userId}`);
    return updated;
  }

  /**
   * Get a single dispute with full detail (for involved parties or admin).
   */
  async findOne(userId: string, disputeId: string, userRole: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          select: {
            id: true,
            title: true,
            status: true,
            contractType: true,
            agreedRate: true,
            student: { select: { id: true, firstName: true, lastName: true, userId: true } },
            employer: { select: { id: true, businessName: true, userId: true } },
          },
        },
        milestone: {
          select: { id: true, title: true, amount: true, status: true },
        },
        serviceOrder: {
          select: { id: true, amount: true, status: true, tierSelected: true },
        },
        raisedBy: { select: { id: true, email: true, role: true } },
        resolvedBy: { select: { id: true, email: true } },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');

    // Only parties or admin can view
    if (userRole !== 'admin') {
      const isParty =
        dispute.contract.student.userId === userId ||
        dispute.contract.employer.userId === userId;
      if (!isParty) throw new ForbiddenException('Access denied');
    }

    return dispute;
  }

  /**
   * List my disputes.
   */
  async findMyDisputes(userId: string, params: { status?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { raisedById: userId },
        { contract: { student: { userId } } },
        { contract: { employer: { userId } } },
      ],
    };
    if (params.status) where.status = params.status;

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contract: { select: { id: true, title: true } },
          milestone: { select: { id: true, title: true, amount: true } },
          raisedBy: { select: { id: true, email: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
