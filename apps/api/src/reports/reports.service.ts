import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ═══ Reports ═══

  async createReport(userId: string, dto: CreateReportDto) {
    const validEntities = ['user', 'gig', 'review', 'community_post', 'community_comment'];
    if (!validEntities.includes(dto.reportedEntity)) {
      throw new BadRequestException(`reportedEntity must be one of: ${validEntities.join(', ')}`);
    }

    return this.prisma.report.create({
      data: {
        reporterId: userId,
        reportedEntity: dto.reportedEntity,
        reportedId: dto.reportedId,
        reason: dto.reason,
      },
    });
  }

  // ═══ Disputes ═══

  async createDispute(userId: string, contractId: string, dto: CreateDisputeDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { userId: true, firstName: true, lastName: true } },
        employer: { select: { userId: true, businessName: true, contactPerson: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');

    const isStudent = contract.student.userId === userId;
    const isEmployer = contract.employer.userId === userId;
    if (!isStudent && !isEmployer) {
      throw new ForbiddenException('You are not a party to this contract');
    }

    if (!['active', 'paused'].includes(contract.status)) {
      throw new BadRequestException('Can only raise disputes on active or paused contracts');
    }

    // Check for existing open dispute
    const existing = await this.prisma.dispute.findFirst({
      where: { contractId, status: 'open' },
    });
    if (existing) {
      throw new ConflictException('An open dispute already exists for this contract');
    }

    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          contractId,
          raisedById: userId,
          reason: dto.reason,
        },
      }),
      this.prisma.contract.update({
        where: { id: contractId },
        data: { status: 'disputed' },
      }),
    ]);

    // Notify the other party
    const otherUserId = isStudent ? contract.employer.userId : contract.student.userId;
    this.notificationsService.create({
      userId: otherUserId,
      type: 'dispute_raised',
      title: 'Dispute Raised',
      body: `A dispute has been raised on contract "${contract.title}"`,
      data: { disputeId: dispute.id, contractId },
    }).catch(() => {});

    return dispute;
  }

  async getDispute(userId: string, disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        contract: {
          include: {
            student: { select: { userId: true, firstName: true, lastName: true } },
            employer: { select: { userId: true, businessName: true, contactPerson: true } },
          },
        },
        raisedBy: {
          select: {
            id: true,
            role: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { businessName: true } },
          },
        },
      },
    });

    if (!dispute) throw new NotFoundException('Dispute not found');

    // Only parties to the contract can view
    const isParty =
      dispute.contract.student.userId === userId ||
      dispute.contract.employer.userId === userId;
    if (!isParty) {
      throw new ForbiddenException('Access denied');
    }

    return dispute;
  }

  async listDisputes(userId: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 50);
    const skip = (page - 1) * limit;

    // Find contracts where user is a party, then get their disputes
    const [studentProfile, employerProfile] = await Promise.all([
      this.prisma.studentProfile.findUnique({ where: { userId }, select: { id: true } }),
      this.prisma.employerProfile.findUnique({ where: { userId }, select: { id: true } }),
    ]);

    const contractWhere: any = { OR: [] };
    if (studentProfile) contractWhere.OR.push({ studentId: studentProfile.id });
    if (employerProfile) contractWhere.OR.push({ employerId: employerProfile.id });

    if (contractWhere.OR.length === 0) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

    const where = { contract: contractWhere };

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          contract: { select: { id: true, title: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
