import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConnectsService } from '../connects/connects.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';

@Injectable()
export class ProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly connectsService: ConnectsService,
  ) {}

  /**
   * Student submits a proposal for a gig.
   */
  async create(studentUserId: string, gigId: string, dto: CreateProposalDto) {
    // 1. Find the student profile
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      throw new BadRequestException('Student profile not found. Please complete your profile first.');
    }

    // 2. Find the gig and validate
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.status !== 'open') {
      throw new BadRequestException('This gig is not accepting proposals');
    }
    if (gig.proposalsCount >= gig.maxProposals) {
      throw new BadRequestException('This gig has reached its maximum number of proposals');
    }

    // 3. Prevent duplicate proposals
    const existing = await this.prisma.proposal.findUnique({
      where: { gigId_studentId: { gigId, studentId: student.id } },
    });
    if (existing) {
      throw new ConflictException('You have already submitted a proposal for this gig');
    }

    // 4. Deduct connects
    await this.connectsService.deductForProposal(studentUserId, gigId, gig.connectsRequired);

    // 5. Create proposal and increment proposalsCount atomically
    const [proposal] = await this.prisma.$transaction([
      this.prisma.proposal.create({
        data: {
          gigId,
          studentId: student.id,
          coverLetter: dto.coverLetter,
          proposedRate: dto.proposedRate,
          estimatedDuration: dto.estimatedDuration,
          proposedMilestones: dto.proposedMilestones ?? [],
          screeningAnswers: dto.screeningAnswers ?? [],
          connectsSpent: gig.connectsRequired,
        },
        include: {
          gig: { select: { id: true, title: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.gig.update({
        where: { id: gigId },
        data: { proposalsCount: { increment: 1 } },
      }),
    ]);

    // Notify employer about new proposal
    const gigForNotif = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: { employer: { select: { userId: true } } },
    });
    if (gigForNotif) {
      this.notificationsService.create({
        userId: gigForNotif.employer.userId,
        type: 'proposal_received',
        title: 'New Proposal Received',
        body: `${proposal.student.firstName} ${proposal.student.lastName} submitted a proposal for "${proposal.gig.title}"`,
        data: { proposalId: proposal.id, gigId },
      }).catch(() => {});
    }

    return proposal;
  }

  /**
   * Employer views proposals for their gig.
   */
  async findByGig(employerUserId: string, gigId: string, params: { page?: number; limit?: number; status?: string }) {
    // Verify the gig belongs to this employer
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId: employerUserId },
    });
    if (!employer) throw new ForbiddenException('Employer profile not found');

    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.employerId !== employer.id) {
      throw new ForbiddenException('You do not own this gig');
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { gigId };
    if (params.status) {
      where.status = params.status;
    }

    const [proposals, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              professionalTitle: true,
              university: true,
              skills: true,
              hourlyRate: true,
              ratingAvg: true,
              ratingCount: true,
              gigsCompleted: true,
              userId: true,
            },
          },
        },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return {
      data: proposals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Student views their own proposals.
   */
  async findMyProposals(studentUserId: string, params: { page?: number; limit?: number; status?: string }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      throw new BadRequestException('Student profile not found');
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { studentId: student.id };
    if (params.status) {
      where.status = params.status;
    }

    const [proposals, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          gig: {
            select: {
              id: true,
              title: true,
              budgetType: true,
              budgetMin: true,
              budgetMax: true,
              currency: true,
              status: true,
              employer: {
                select: { id: true, businessName: true, contactPerson: true, logoUrl: true, ratingAvg: true },
              },
            },
          },
        },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return {
      data: proposals,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single proposal by ID.
   */
  async findOne(userId: string, userRole: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            budgetType: true,
            budgetMin: true,
            budgetMax: true,
            currency: true,
            status: true,
            employerId: true,
            employer: {
              select: { id: true, businessName: true, contactPerson: true, userId: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionalTitle: true,
            university: true,
            skills: true,
            hourlyRate: true,
            ratingAvg: true,
            ratingCount: true,
            gigsCompleted: true,
            userId: true,
          },
        },
        contract: { select: { id: true, status: true } },
      },
    });

    if (!proposal) throw new NotFoundException('Proposal not found');

    // Authorization: only the student who submitted or the employer who owns the gig can view
    if (userRole === 'STUDENT' && proposal.student.userId !== userId) {
      throw new ForbiddenException('You can only view your own proposals');
    }
    if (userRole === 'EMPLOYER' && proposal.gig.employer.userId !== userId) {
      throw new ForbiddenException('You can only view proposals for your own gigs');
    }

    return proposal;
  }

  /**
   * Employer updates proposal status (shortlist, decline, hire, etc.)
   */
  async updateStatus(employerUserId: string, proposalId: string, dto: UpdateProposalStatusDto) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            employerId: true,
            employer: { select: { userId: true, id: true } },
          },
        },
        student: { select: { id: true, firstName: true, lastName: true, userId: true } },
      },
    });

    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.gig.employer.userId !== employerUserId) {
      throw new ForbiddenException('You do not own this gig');
    }

    // If hiring, create a contract and update gig status
    if (dto.status === 'hired') {
      const result = await this.prisma.$transaction(async (tx) => {
        // Update proposal status
        const updated = await tx.proposal.update({
          where: { id: proposalId },
          data: { status: 'hired', employerNotes: dto.employerNotes },
        });

        // Create contract from proposal
        const contract = await tx.contract.create({
          data: {
            gigId: proposal.gig.id,
            proposalId: proposal.id,
            studentId: proposal.student.id,
            employerId: proposal.gig.employer.id,
            contractType: 'fixed',
            title: proposal.gig.title,
            agreedRate: proposal.proposedRate,
          },
        });

        // Update gig status to hired
        await tx.gig.update({
          where: { id: proposal.gig.id },
          data: { status: 'hired' },
        });

        return { proposal: updated, contract };
      });

      // Notify student they've been hired
      this.notificationsService.create({
        userId: proposal.student.userId,
        type: 'proposal_hired',
        title: 'You\'ve Been Hired!',
        body: `Congratulations! You\'ve been hired for "${proposal.gig.title}"`,
        data: { proposalId: proposal.id, contractId: result.contract.id, gigId: proposal.gig.id },
      }).catch(() => {});

      return result;
    }

    // Regular status update
    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: dto.status,
        employerNotes: dto.employerNotes,
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Notify student of status change
    if (dto.status === 'shortlisted') {
      this.notificationsService.create({
        userId: proposal.student.userId,
        type: 'proposal_shortlisted',
        title: 'Proposal Shortlisted',
        body: `Your proposal for "${proposal.gig.title}" has been shortlisted`,
        data: { proposalId: proposal.id, gigId: proposal.gig.id },
      }).catch(() => {});
    } else if (dto.status === 'declined') {
      // Refund connects on decline
      this.connectsService.refundForProposal(
        proposal.student.userId,
        proposal.gig.id,
        proposal.connectsSpent || 2,
      ).catch(() => {});

      this.notificationsService.create({
        userId: proposal.student.userId,
        type: 'proposal_declined',
        title: 'Proposal Update',
        body: `Your proposal for "${proposal.gig.title}" was not selected`,
        data: { proposalId: proposal.id, gigId: proposal.gig.id },
      }).catch(() => {});
    }

    return updated;
  }

  /**
   * Student withdraws their proposal.
   */
  async withdraw(studentUserId: string, proposalId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.studentId !== student.id) {
      throw new ForbiddenException('You can only withdraw your own proposals');
    }
    if (proposal.status === 'hired') {
      throw new BadRequestException('Cannot withdraw an already hired proposal');
    }
    if (proposal.status === 'withdrawn') {
      throw new BadRequestException('Proposal is already withdrawn');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'withdrawn' },
      }),
      this.prisma.gig.update({
        where: { id: proposal.gigId },
        data: { proposalsCount: { decrement: 1 } },
      }),
    ]);

    return updated;
  }
}
