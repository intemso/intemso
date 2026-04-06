import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConnectsService } from '../connects/connects.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

/** Valid status transitions for applications */
const VALID_TRANSITIONS: Record<string, string[]> = {
  applied: ['reviewed', 'hired', 'declined'],
  reviewed: ['hired', 'declined'],
  hired: [],
  declined: [],
  withdrawn: [],
};

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly connectsService: ConnectsService,
  ) {}

  /**
   * Student applies for a gig (Easy Apply).
   */
  async create(studentUserId: string, gigId: string, dto: CreateApplicationDto) {
    // 1. Find the student profile
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) {
      throw new BadRequestException('Student profile not found. Please complete your profile first.');
    }

    // 2. Find the gig and validate
    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: { employer: { select: { userId: true } } },
    });
    if (!gig) throw new NotFoundException('Gig not found');

    // Prevent self-application (employer applying to their own gig)
    if (gig.employer.userId === studentUserId) {
      throw new BadRequestException('You cannot apply to your own gig');
    }

    if (gig.status !== 'open') {
      throw new BadRequestException('This gig is not accepting applications');
    }
    if (gig.applicationsCount >= gig.maxApplications) {
      throw new BadRequestException('This gig has reached its maximum number of applications');
    }

    // 3. Prevent duplicate applications
    const existing = await this.prisma.application.findUnique({
      where: { gigId_studentId: { gigId, studentId: student.id } },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this gig');
    }

    // 4. Validate screening answers match gig questions count
    const screeningQuestions = (gig as any).screeningQuestions ?? [];
    if (Array.isArray(screeningQuestions) && screeningQuestions.length > 0) {
      const answers = dto.screeningAnswers ?? [];
      if (answers.length !== screeningQuestions.length) {
        throw new BadRequestException(
          `Expected ${screeningQuestions.length} screening answers, got ${answers.length}`,
        );
      }
    }

    // 5. Atomic: deduct connects + create application + increment count
    const application = await this.prisma.$transaction(async (tx) => {
      // Deduct connects inside the transaction
      await this.connectsService.deductForApplicationWithTx(
        tx, studentUserId, gigId, gig.connectsRequired,
      );

      // Create application
      const app = await tx.application.create({
        data: {
          gigId,
          studentId: student.id,
          note: dto.note,
          suggestedRate: dto.suggestedRate,
          screeningAnswers: dto.screeningAnswers ?? [],
          connectsSpent: gig.connectsRequired,
        },
        include: {
          gig: { select: { id: true, title: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Increment applications count
      await tx.gig.update({
        where: { id: gigId },
        data: { applicationsCount: { increment: 1 } },
      });

      return app;
    });

    // Notify employer about new application (fire-and-forget with logging)
    const gigForNotif = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: { employer: { select: { userId: true } } },
    });
    if (gigForNotif) {
      this.notificationsService.create({
        userId: gigForNotif.employer.userId,
        type: 'new_application',
        title: 'New Application Received',
        body: `${application.student.firstName} ${application.student.lastName} applied for "${application.gig.title}"`,
        data: { applicationId: application.id, gigId },
      }).catch((err) => this.logger.error('Failed to send new_application notification', err));
    }

    return application;
  }

  /**
   * Employer views applications for their gig.
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

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
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
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Student views their own applications.
   */
  async findMyApplications(studentUserId: string, params: { page?: number; limit?: number; status?: string }) {
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

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
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
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Employer views all applications across all their gigs.
   */
  async findEmployerApplications(employerUserId: string, params: { page?: number; limit?: number; status?: string }) {
    const employer = await this.prisma.employerProfile.findUnique({
      where: { userId: employerUserId },
    });
    if (!employer) throw new ForbiddenException('Employer profile not found');

    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { gig: { employerId: employer.id } };
    if (params.status) {
      where.status = params.status;
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          gig: {
            select: { id: true, title: true, budgetType: true, budgetMin: true, budgetMax: true, currency: true, status: true },
          },
          student: {
            select: {
              id: true, firstName: true, lastName: true, professionalTitle: true,
              university: true, skills: true, hourlyRate: true, ratingAvg: true,
              ratingCount: true, gigsCompleted: true, userId: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data: applications,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single application by ID.
   */
  async findOne(userId: string, userRole: string, applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
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

    if (!application) throw new NotFoundException('Application not found');

    // Authorization: only the student who applied or the employer who owns the gig can view
    if (userRole === 'STUDENT' && application.student.userId !== userId) {
      throw new ForbiddenException('You can only view your own applications');
    }
    if (userRole === 'EMPLOYER' && application.gig.employer.userId !== userId) {
      throw new ForbiddenException('You can only view applications for your own gigs');
    }

    return application;
  }

  /**
   * Employer updates application status (review, hire, decline).
   */
  async updateStatus(employerUserId: string, applicationId: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            employerId: true,
            budgetMin: true,
            employer: { select: { userId: true, id: true } },
          },
        },
        student: { select: { id: true, firstName: true, lastName: true, userId: true, hourlyRate: true } },
      },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.gig.employer.userId !== employerUserId) {
      throw new ForbiddenException('You do not own this gig');
    }

    // Validate status transition
    const allowed = VALID_TRANSITIONS[application.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${application.status}" to "${dto.status}"`,
      );
    }

    // If hiring, create a contract and update gig status
    if (dto.status === 'hired') {
      // Guard against rate=0: require at least one non-zero rate source
      const agreedRate = application.suggestedRate ?? application.gig.budgetMin ?? application.student.hourlyRate;
      if (!agreedRate || Number(agreedRate) <= 0) {
        throw new BadRequestException(
          'Cannot hire: no valid agreed rate. The student must set an hourly rate or suggest a rate.',
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Prevent concurrent hires: check if another student was already hired
        const existingHire = await tx.application.findFirst({
          where: { gigId: application.gig.id, status: 'hired' },
        });
        if (existingHire) {
          throw new ConflictException('Another student has already been hired for this gig');
        }

        // Update application status
        const updated = await tx.application.update({
          where: { id: applicationId },
          data: { status: 'hired', employerNotes: dto.employerNotes },
        });

        // Create contract from application
        const contract = await tx.contract.create({
          data: {
            gigId: application.gig.id,
            applicationId: application.id,
            studentId: application.student.id,
            employerId: application.gig.employer.id,
            contractType: 'fixed',
            title: application.gig.title,
            agreedRate,
          },
        });

        // Update gig status to hired
        await tx.gig.update({
          where: { id: application.gig.id },
          data: { status: 'hired' },
        });

        return { application: updated, contract };
      });

      // Notify student they've been hired
      this.notificationsService.create({
        userId: application.student.userId,
        type: 'application_hired',
        title: 'You\'ve Been Hired!',
        body: `Congratulations! You\'ve been hired for "${application.gig.title}"`,
        data: { applicationId: application.id, contractId: result.contract.id, gigId: application.gig.id },
      }).catch((err) => this.logger.error('Failed to send application_hired notification', err));

      return result;
    }

    // For decline: refund connects atomically within transaction
    if (dto.status === 'declined') {
      const updated = await this.prisma.$transaction(async (tx) => {
        const upd = await tx.application.update({
          where: { id: applicationId },
          data: { status: dto.status, employerNotes: dto.employerNotes },
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
          },
        });

        // Refund connects within the same transaction
        await this.connectsService.refundForApplicationWithTx(
          tx,
          application.student.userId,
          application.gig.id,
          application.connectsSpent || 1,
        );

        return upd;
      });

      this.notificationsService.create({
        userId: application.student.userId,
        type: 'application_declined',
        title: 'Application Update',
        body: `Your application for "${application.gig.title}" was not selected`,
        data: { applicationId: application.id, gigId: application.gig.id },
      }).catch((err) => this.logger.error('Failed to send application_declined notification', err));

      return updated;
    }

    // Regular status update (reviewed)
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
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

    if (dto.status === 'reviewed') {
      this.notificationsService.create({
        userId: application.student.userId,
        type: 'application_reviewed',
        title: 'Application Reviewed',
        body: `Your application for "${application.gig.title}" is being reviewed`,
        data: { applicationId: application.id, gigId: application.gig.id },
      }).catch((err) => this.logger.error('Failed to send application_reviewed notification', err));
    }

    return updated;
  }

  /**
   * Student withdraws their application.
   */
  async withdraw(studentUserId: string, applicationId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!student) throw new BadRequestException('Student profile not found');

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.studentId !== student.id) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }
    if (application.status === 'hired') {
      throw new BadRequestException('Cannot withdraw an already hired application');
    }
    if (application.status === 'withdrawn') {
      throw new BadRequestException('Application is already withdrawn');
    }
    if (application.status === 'declined') {
      throw new BadRequestException('Cannot withdraw a declined application');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.application.update({
        where: { id: applicationId },
        data: { status: 'withdrawn' },
      });

      // Decrement applicationsCount with floor guard (never go below 0)
      const gig = await tx.gig.findUnique({ where: { id: application.gigId } });
      if (gig && gig.applicationsCount > 0) {
        await tx.gig.update({
          where: { id: application.gigId },
          data: { applicationsCount: { decrement: 1 } },
        });
      }

      // Refund connects on withdrawal
      await this.connectsService.refundForApplicationWithTx(
        tx,
        studentUserId,
        application.gigId,
        application.connectsSpent || 1,
      );

      return upd;
    });

    return updated;
  }
}
