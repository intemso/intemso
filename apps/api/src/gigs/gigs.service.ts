import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';

@Injectable()
export class GigsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    budgetType?: string;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { status: 'open' };

    if (params.category) {
      where.categoryId = params.category;
    }
    if (params.budgetType) {
      where.budgetType = params.budgetType;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [gigs, total] = await Promise.all([
      this.prisma.gig.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: { id: true, businessName: true, contactPerson: true, logoUrl: true },
          },
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.gig.count({ where }),
    ]);

    return {
      data: gigs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyGigs(employerId: string, params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 50, 100);
    const skip = (page - 1) * limit;

    const where: any = { employerId };
    if (params.status) {
      where.status = params.status;
    }

    const [gigs, total] = await Promise.all([
      this.prisma.gig.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
        },
      }),
      this.prisma.gig.count({ where }),
    ]);

    return {
      data: gigs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    return this.prisma.gig.findUnique({
      where: { id },
      include: {
        employer: {
          select: { id: true, businessName: true, contactPerson: true, logoUrl: true },
        },
        category: { select: { id: true, name: true } },
        proposals: { select: { id: true, status: true, proposedRate: true } },
      },
    });
  }

  async create(employerId: string, data: CreateGigDto) {
    return this.prisma.gig.create({
      data: {
        ...data,
        employerId,
        status: 'open',
      },
    });
  }

  async update(id: string, employerId: string, data: UpdateGigDto) {
    const gig = await this.prisma.gig.findUnique({ where: { id } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.employerId !== employerId) throw new ForbiddenException('You do not own this gig');

    return this.prisma.gig.update({
      where: { id },
      data,
      include: {
        employer: {
          select: { id: true, businessName: true, contactPerson: true, logoUrl: true },
        },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string, employerId: string) {
    const gig = await this.prisma.gig.findUnique({ where: { id } });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.employerId !== employerId) throw new ForbiddenException('You do not own this gig');

    await this.prisma.gig.delete({ where: { id } });
    return { deleted: true };
  }
}
