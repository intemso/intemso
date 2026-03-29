import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/portfolio.dto';

const STUDENT_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  professionalTitle: true,
  university: true,
  ratingAvg: true,
  ratingCount: true,
  isVerified: true,
  gigsCompleted: true,
  skills: true,
  user: { select: { avatarUrl: true } },
};

@Injectable()
export class ShowcaseService {
  constructor(private prisma: PrismaService) {}

  /** Public browsing — Dribbble-style feed */
  async findAll(params: {
    search?: string;
    categoryId?: string;
    skills?: string;
    studentId?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 24, 48);
    const skip = (page - 1) * limit;

    const where: Prisma.PortfolioItemWhereInput = {
      status: 'published',
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { skills: { hasSome: [term] } },
        { clientName: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.skills) {
      const skillList = params.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillList.length > 0) {
        where.skills = { hasSome: skillList };
      }
    }

    if (params.studentId) {
      where.studentId = params.studentId;
    }

    let orderBy: Prisma.PortfolioItemOrderByWithRelationInput;
    switch (params.sortBy) {
      case 'popular':
        orderBy = { likeCount: 'desc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.portfolioItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          student: { select: STUDENT_SELECT },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.portfolioItem.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Single portfolio item detail (public) */
  async findById(id: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id },
      include: {
        student: { select: STUDENT_SELECT },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');

    // Increment view count (fire & forget)
    this.prisma.portfolioItem
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return item;
  }

  /** Student's own portfolio items (all statuses) */
  async findMine(studentId: string) {
    return this.prisma.portfolioItem.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /** Create a new portfolio item */
  async create(studentId: string, dto: CreatePortfolioItemDto) {
    return this.prisma.portfolioItem.create({
      data: {
        studentId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId || null,
        skills: dto.skills || [],
        images: dto.images || [],
        projectUrl: dto.projectUrl || null,
        clientName: dto.clientName || null,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        status: (dto.status as any) || 'published',
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /** Update a portfolio item (owner only) */
  async update(id: string, studentId: string, dto: UpdatePortfolioItemDto) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    if (item.studentId !== studentId)
      throw new ForbiddenException('Not your portfolio item');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId || null;
    if (dto.skills !== undefined) data.skills = dto.skills;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.projectUrl !== undefined) data.projectUrl = dto.projectUrl || null;
    if (dto.clientName !== undefined) data.clientName = dto.clientName || null;
    if (dto.completedAt !== undefined)
      data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
    if (dto.status !== undefined) data.status = dto.status;

    return this.prisma.portfolioItem.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  /** Delete a portfolio item (owner only) */
  async remove(id: string, studentId: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    if (item.studentId !== studentId)
      throw new ForbiddenException('Not your portfolio item');

    await this.prisma.portfolioItem.delete({ where: { id } });
    return { deleted: true };
  }

  /** Like / unlike a portfolio item */
  async toggleLike(id: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');

    // Simple toggle — increment like count
    return this.prisma.portfolioItem.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
      select: { id: true, likeCount: true },
    });
  }

  /** Featured items for homepage / highlight section */
  async findFeatured(limit = 8) {
    return this.prisma.portfolioItem.findMany({
      where: { status: 'published', isFeatured: true },
      orderBy: { likeCount: 'desc' },
      take: limit,
      include: {
        student: { select: STUDENT_SELECT },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }
}
