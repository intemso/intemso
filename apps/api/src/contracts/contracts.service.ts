import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CommunityService } from '../community/community.service';
import { ConnectsService } from '../connects/connects.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly communityService: CommunityService,
    private readonly connectsService: ConnectsService,
  ) {}

  /**
   * Employer creates a contract (direct hire or from proposal).
   * Note: Hiring via proposal status update also creates contracts automatically in ProposalsService.
   */
  async create(employerUserId: string, dto: CreateContractDto) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId: employerUserId },
    });
    if (!employer) throw new BadRequestException('Employer profile not found');

    // Verify the student exists
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: dto.studentId },
    });
    if (!student) throw new BadRequestException('Student not found');

    // If from a gig, verify ownership
    if (dto.gigId) {
      const gig = await this.prisma.gig.findUnique({ where: { id: dto.gigId } });
      if (!gig) throw new NotFoundException('Gig not found');
      if (gig.employerId !== employer.id) throw new ForbiddenException('You do not own this gig');
    }

    const contract = await this.prisma.contract.create({
      data: {
        gigId: dto.gigId,
        proposalId: dto.proposalId,
        studentId: dto.studentId,
        employerId: employer.id,
        contractType: dto.contractType,
        title: dto.title,
        description: dto.description,
        agreedRate: dto.agreedRate,
        weeklyLimit: dto.weeklyLimit,
        isDirect: dto.isDirect ?? !dto.proposalId,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, userId: true } },
        employer: { select: { id: true, businessName: true, contactPerson: true } },
        milestones: true,
      },
    });

    // Update gig status if tied to a gig
    if (dto.gigId) {
      await this.prisma.gig.update({
        where: { id: dto.gigId },
        data: { status: 'in_progress' },
      });
    }

    return contract;
  }

  /**
   * User's contracts (student or employer).
   */
  async findMyContracts(userId: string, userRole: string, params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    let where: any = {};

    if (userRole === 'STUDENT') {
      const student = await this.prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (!student) throw new BadRequestException('Student profile not found');
      where.studentId = student.id;
    } else if (userRole === 'EMPLOYER') {
      const employer = await this.prisma.employerProfile.findUnique({
        where: { userId },
      });
      if (!employer) throw new BadRequestException('Employer profile not found');
      where.employerId = employer.id;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, userId: true, ratingAvg: true },
          },
          employer: {
            select: { id: true, businessName: true, contactPerson: true, logoUrl: true, ratingAvg: true, userId: true },
          },
          gig: { select: { id: true, title: true } },
          milestones: {
            select: { id: true, title: true, amount: true, status: true, sortOrder: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data: contracts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Single contract detail with milestones.
   */
  async findOne(userId: string, userRole: string, contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: {
          select: {
            id: true, firstName: true, lastName: true, professionalTitle: true,
            university: true, ratingAvg: true, ratingCount: true, userId: true,
          },
        },
        employer: {
          select: {
            id: true, businessName: true, contactPerson: true, logoUrl: true,
            ratingAvg: true, ratingCount: true, userId: true,
          },
        },
        gig: { select: { id: true, title: true, description: true, budgetType: true, budgetMin: true, budgetMax: true } },
        milestones: {
          orderBy: { sortOrder: 'asc' },
        },
        proposal: { select: { id: true, coverLetter: true, proposedRate: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');

    // Authorization: only student or employer on this contract
    if (userRole === 'STUDENT' && contract.student.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (userRole === 'EMPLOYER' && contract.employer.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return contract;
  }

  /**
   * Update contract status (pause, resume, complete, cancel).
   */
  async updateStatus(userId: string, contractId: string, dto: UpdateContractStatusDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { userId: true } },
        employer: { select: { userId: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');

    // Both student and employer can manage contract status
    if (contract.student.userId !== userId && contract.employer.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {
      status: dto.status,
      endedById: userId,
    };

    if (dto.endReason) {
      updateData.endReason = dto.endReason;
    }

    if (dto.status === 'paused') {
      updateData.pausedAt = new Date();
    }
    if (dto.status === 'completed') {
      updateData.completedAt = new Date();
      // Update gig status
      if (contract.gigId) {
        await this.prisma.gig.update({
          where: { id: contract.gigId },
          data: { status: 'completed' },
        });
      }
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: updateData,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        employer: { select: { id: true, businessName: true } },
        milestones: { orderBy: { sortOrder: 'asc' } },
      },
    });

    // Notify the other party
    const otherUserId = contract.student.userId === userId
      ? contract.employer.userId
      : contract.student.userId;

    const statusLabels: Record<string, string> = {
      paused: 'paused',
      active: 'resumed',
      completed: 'marked as completed',
      cancelled: 'cancelled',
    };
    const label = statusLabels[dto.status] || dto.status;

    this.notificationsService.create({
      userId: otherUserId,
      type: 'contract_status_changed',
      title: 'Contract Update',
      body: `Contract "${updated.title}" has been ${label}.`,
      data: { contractId },
    }).catch(() => {});

    // Auto-generate achievement post when contract is completed
    if (dto.status === 'completed') {
      const studentName = [updated.student.firstName, updated.student.lastName].filter(Boolean).join(' ') || 'A student';
      const employerName = updated.employer.businessName || 'an employer';
      this.communityService.createAutoPost({
        authorId: contract.student.userId,
        type: 'gig_completed',
        content: `🏆 ${studentName} just completed "${updated.title}" for ${employerName}! Great work on another successful gig! 🎉`,
        gigId: contract.gigId || undefined,
        tags: ['gigcompleted', 'achievement'],
      }).catch(() => {});

      // Award 5 connects to the student for completing a gig
      this.connectsService.rewardGigCompleted(updated.student.id, contractId).catch(() => {});
    }

    return updated;
  }

  async getInvoices(userId: string, role: string, contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        id: true,
        contractType: true,
        student: { select: { userId: true } },
        employer: { select: { userId: true } },
      },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const isStudent = contract.student.userId === userId;
    const isEmployer = contract.employer.userId === userId;
    if (!isStudent && !isEmployer && role !== 'admin') {
      throw new ForbiddenException('Not authorized to view invoices');
    }

    if (contract.contractType !== 'hourly') {
      throw new BadRequestException('Invoices are only available for hourly contracts');
    }

    const invoices = await this.prisma.weeklyInvoice.findMany({
      where: { contractId },
      orderBy: { billingWeek: 'desc' },
      select: {
        id: true,
        billingWeek: true,
        totalHours: true,
        hourlyRate: true,
        subtotal: true,
        platformFee: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    return { contractId, invoices };
  }
}
