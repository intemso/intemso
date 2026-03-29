import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Leave a review for a completed contract.
   * Either party (student or employer) can review the other.
   */
  async create(userId: string, contractId: string, dto: CreateReviewDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        student: { select: { id: true, userId: true, firstName: true, lastName: true } },
        employer: { select: { id: true, userId: true, businessName: true, contactPerson: true } },
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'completed') {
      throw new BadRequestException('Can only review completed contracts');
    }

    // Determine reviewer and reviewee
    const isStudent = contract.student.userId === userId;
    const isEmployer = contract.employer.userId === userId;

    if (!isStudent && !isEmployer) {
      throw new ForbiddenException('You are not a party to this contract');
    }

    const revieweeId = isStudent ? contract.employer.userId : contract.student.userId;

    // Enforce 14-day review window
    if (contract.completedAt) {
      const daysSinceCompletion =
        (Date.now() - new Date(contract.completedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCompletion > 14) {
        throw new BadRequestException('The 14-day review window has expired for this contract');
      }
    }

    // Prevent duplicate reviews (unique constraint: contractId + reviewerId)
    const existing = await this.prisma.review.findUnique({
      where: { contractId_reviewerId: { contractId, reviewerId: userId } },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this contract');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        contractId,
        reviewerId: userId,
        revieweeId,
        rating: dto.rating,
        comment: dto.comment || null,
      },
    });

    // Update reviewee's rating stats
    await this.updateRatingStats(revieweeId);

    // Notify the reviewee
    this.notificationsService.create({
      userId: revieweeId,
      type: 'review_received',
      title: 'New Review Received',
      body: `You received a ${dto.rating}-star review${dto.comment ? `: "${dto.comment.substring(0, 80)}${dto.comment.length > 80 ? '...' : ''}"` : ''}`,
      data: { reviewId: review.id, contractId, rating: dto.rating },
    }).catch(() => {});

    return review;
  }

  /**
   * Get all visible reviews for a user (public).
   */
  async findByUser(userId: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 10, 50);
    const skip = (page - 1) * limit;

    const where = { revieweeId: userId, isVisible: true, isFlagged: false };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              role: true,
              studentProfile: { select: { firstName: true, lastName: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
          contract: {
            select: { id: true, title: true },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    // Enrich with reviewer name
    const enriched = data.map((r) => ({
      ...r,
      reviewerName:
        r.reviewer.role === 'student'
          ? `${r.reviewer.studentProfile?.firstName ?? ''} ${r.reviewer.studentProfile?.lastName ?? ''}`.trim()
          : r.reviewer.employerProfile?.businessName || r.reviewer.employerProfile?.contactPerson || 'Anonymous',
    }));

    return {
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get reviews for a specific contract.
   */
  async findByContract(contractId: string) {
    return this.prisma.review.findMany({
      where: { contractId, isVisible: true },
      include: {
        reviewer: {
          select: {
            id: true,
            role: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
      },
    });
  }

  /**
   * Flag a review for moderation.
   */
  async flag(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');

    // Only the reviewee can flag
    if (review.revieweeId !== userId) {
      throw new ForbiddenException('Only the reviewed party can flag a review');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isFlagged: true },
    });
  }

  /**
   * Recalculate ratingAvg and ratingCount on the user's profile.
   */
  private async updateRatingStats(userId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { revieweeId: userId, isVisible: true, isFlagged: false },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avg = stats._avg.rating ?? 0;
    const count = stats._count.rating ?? 0;

    // Determine which profile to update
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'student') {
      await this.prisma.studentProfile.updateMany({
        where: { userId },
        data: { ratingAvg: Math.round(avg * 100) / 100, ratingCount: count },
      });
    } else if (user?.role === 'employer') {
      await this.prisma.employerProfile.updateMany({
        where: { userId },
        data: { ratingAvg: Math.round(avg * 100) / 100, ratingCount: count },
      });
    }
  }
}
