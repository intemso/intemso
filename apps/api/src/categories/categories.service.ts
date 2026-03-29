import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { active?: boolean } = {}) {
    const where: any = {};

    if (params.active !== undefined) {
      where.isActive = params.active;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { gigs: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { gigs: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        isActive: true,
        sortOrder: true,
        _count: { select: { gigs: true } },
      },
    });
  }
}
