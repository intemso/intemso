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
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
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
    const gig = await this.prisma.gig.findUnique({ where: { id: gigId } });
    if (!gig) throw new NotFoundException('Gig not found');
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

    // 4. Deduct connects (1 per application)
    await this.connectsService.deductForApplication(studentUserId, gigId, gig.connectsRequired);

    // 5. Create application and increment applicationsCount atomically
    const [application] = await this.prisma.$transaction([
      this.prisma.application.create({
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
      }),
      this.prisma.gig.update({
        where: { id: gigId },
        data: { applicationsCount: { increment: 1 } },
      }),
    ]);

    // Notify employer about new application
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
      }).catch(() => {});
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

    // If hiring, create a contract and update gig status
    if (dto.status === 'hired') {
      // Use suggested rate, or gig budget min, or student hourly rate
      const agreedRate = application.suggestedRate ?? application.gig.budgetMin ?? application.student.hourlyRate ?? 0;

      const result = await this.prisma.$transaction(async (tx) => {
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
      }).catch(() => {});

      return result;
    }

    // Regular status update
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

    // Notify student of status change
    if (dto.status === 'reviewed') {
      this.notificationsService.create({
        userId: application.student.userId,
        type: 'application_reviewed',
        title: 'Application Reviewed',
        body: `Your application for "${application.gig.title}" is being reviewed`,
        data: { applicationId: application.id, gigId: application.gig.id },
      }).catch(() => {});
    } else if (dto.status === 'declined') {
      // Refund connects on decline
      this.connectsService.refundForApplication(
        application.student.userId,
        application.gig.id,
        application.connectsSpent || 1,
      ).catch(() => {});

      this.notificationsService.create({
        userId: application.student.userId,
        type: 'application_declined',
        title: 'Application Update',
        body: `Your application for "${application.gig.title}" was not selected`,
        data: { applicationId: application.id, gigId: application.gig.id },
      }).catch(() => {});
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

    const [updated] = await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: applicationId },
        data: { status: 'withdrawn' },
      }),
      this.prisma.gig.update({
        where: { id: application.gigId },
        data: { applicationsCount: { decrement: 1 } },
      }),
    ]);

    return updated;
  }
}
