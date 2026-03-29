import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { SearchStudentsDto } from './dto/search-students.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchStudentsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentProfileWhereInput = {
      user: { isActive: true },
    };

    // Full-text search on name, bio, skills
    if (dto.search) {
      const term = dto.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { professionalTitle: { contains: term, mode: 'insensitive' } },
        { skills: { has: term } },
      ];
    }

    // Filter by skills (comma-separated)
    if (dto.skills) {
      const skillList = dto.skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        where.skills = { hasSome: skillList };
      }
    }

    // Filter by university
    if (dto.university) {
      where.university = { contains: dto.university, mode: 'insensitive' };
    }

    // Filter by hourly rate range
    if (dto.minRate !== undefined || dto.maxRate !== undefined) {
      where.hourlyRate = {};
      if (dto.minRate !== undefined) where.hourlyRate.gte = dto.minRate;
      if (dto.maxRate !== undefined) where.hourlyRate.lte = dto.maxRate;
    }

    // Filter by minimum rating
    if (dto.minRating !== undefined) {
      where.ratingAvg = { gte: dto.minRating };
    }

    // Filter by talent badge
    if (dto.talentBadge) {
      where.talentBadge = dto.talentBadge as any;
    }

    // Filter by availability
    if (dto.availability) {
      where.availability = dto.availability as any;
    }

    // Sorting
    const orderBy: Prisma.StudentProfileOrderByWithRelationInput = {};
    const sortOrder = dto.sortOrder || 'desc';
    switch (dto.sortBy) {
      case 'rating':
        orderBy.ratingAvg = sortOrder;
        break;
      case 'gigsCompleted':
        orderBy.gigsCompleted = sortOrder;
        break;
      case 'hourlyRate':
        orderBy.hourlyRate = sortOrder === 'asc' ? 'asc' : 'desc';
        break;
      case 'responseTime':
        orderBy.responseTimeHrs = sortOrder === 'asc' ? 'asc' : 'desc';
        break;
      default:
        orderBy.ratingAvg = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          professionalTitle: true,
          university: true,
          bio: true,
          skills: true,
          hourlyRate: true,
          isVerified: true,
          ratingAvg: true,
          ratingCount: true,
          jobSuccessScore: true,
          totalEarned: true,
          gigsCompleted: true,
          responseTimeHrs: true,
          onTimeRate: true,
          talentBadge: true,
          portfolioUrls: true,
          availability: true,
          createdAt: true,
        },
      }),
      this.prisma.studentProfile.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        professionalTitle: true,
        university: true,
        major: true,
        bio: true,
        skills: true,
        hourlyRate: true,
        isVerified: true,
        ratingAvg: true,
        ratingCount: true,
        jobSuccessScore: true,
        totalEarned: true,
        gigsCompleted: true,
        responseTimeHrs: true,
        onTimeRate: true,
        rehireRate: true,
        talentBadge: true,
        portfolioUrls: true,
        availability: true,
        createdAt: true,
        user: {
          select: { createdAt: true },
        },
      },
    });

    if (!profile || !(await this.isUserActive(profile.userId))) {
      return null;
    }

    return profile;
  }

  private async isUserActive(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });
    return user?.isActive ?? false;
  }
}
