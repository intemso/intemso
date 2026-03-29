import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ── Service Listings ──

  async create(studentId: string, dto: CreateServiceDto) {
    return this.prisma.serviceListing.create({
      data: {
        studentId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId || null,
        tags: dto.tags || [],
        deliveryDays: dto.deliveryDays,
        tiers: dto.tiers || [],
        faq: dto.faq || [],
        status: 'draft',
      },
    });
  }

  async update(id: string, studentId: string, dto: UpdateServiceDto) {
    const listing = await this.prisma.serviceListing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Service not found');
    if (listing.studentId !== studentId)
      throw new ForbiddenException('Not your service');

    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId || null;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.deliveryDays !== undefined) data.deliveryDays = dto.deliveryDays;
    if (dto.tiers !== undefined) data.tiers = dto.tiers;
    if (dto.faq !== undefined) data.faq = dto.faq;
    if (dto.status !== undefined) {
      if (!['draft', 'active', 'paused'].includes(dto.status))
        throw new BadRequestException('Invalid status');
      data.status = dto.status;
    }

    return this.prisma.serviceListing.update({ where: { id }, data });
  }

  async findAll(params: {
    search?: string;
    categoryId?: string;
    tags?: string;
    minPrice?: number;
    maxDeliveryDays?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceListingWhereInput = {
      status: 'active',
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { tags: { has: term } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.tags) {
      const tagList = params.tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        where.tags = { hasSome: tagList };
      }
    }

    if (params.maxDeliveryDays) {
      where.deliveryDays = { lte: params.maxDeliveryDays };
    }

    const orderBy: Prisma.ServiceListingOrderByWithRelationInput = {};
    switch (params.sortBy) {
      case 'rating':
        orderBy.ratingAvg = 'desc';
        break;
      case 'orders':
        orderBy.ordersCount = 'desc';
        break;
      case 'newest':
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.ordersCount = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.serviceListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              professionalTitle: true,
              ratingAvg: true,
              ratingCount: true,
              isVerified: true,
              university: true,
            },
          },
          category: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.serviceListing.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const listing = await this.prisma.serviceListing.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionalTitle: true,
            university: true,
            ratingAvg: true,
            ratingCount: true,
            isVerified: true,
            gigsCompleted: true,
            responseTimeHrs: true,
          },
        },
        category: { select: { name: true, slug: true } },
        _count: { select: { orders: true } },
      },
    });

    if (!listing) throw new NotFoundException('Service not found');
    return listing;
  }

  async findMyListings(studentId: string) {
    return this.prisma.serviceListing.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        _count: { select: { orders: true } },
      },
    });
  }

  // ── Service Orders ──

  async createOrder(
    serviceId: string,
    employerId: string,
    dto: CreateOrderDto,
  ) {
    const listing = await this.prisma.serviceListing.findUnique({
      where: { id: serviceId },
    });
    if (!listing) throw new NotFoundException('Service not found');
    if (listing.status !== 'active')
      throw new BadRequestException('Service is not available');

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + listing.deliveryDays);

    const order = await this.prisma.serviceOrder.create({
      data: {
        serviceListingId: serviceId,
        employerId,
        studentId: listing.studentId,
        tierSelected: dto.tierSelected,
        amount: dto.amount,
        requirements: dto.requirements,
        status: 'pending',
        deliveryDeadline: deadline,
      },
    });

    // Increment orders count
    await this.prisma.serviceListing.update({
      where: { id: serviceId },
      data: { ordersCount: { increment: 1 } },
    });

    return order;
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        serviceListing: {
          select: { id: true, title: true, tiers: true },
        },
        student: {
          select: { id: true, firstName: true, lastName: true, userId: true },
        },
        employer: {
          select: { id: true, businessName: true, contactPerson: true, userId: true },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Verify party access
    if (order.student.userId !== userId && order.employer.userId !== userId)
      throw new ForbiddenException('Not your order');

    return order;
  }

  async updateOrderStatus(orderId: string, userId: string, status: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: {
        student: { select: { userId: true } },
        employer: { select: { userId: true } },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Validate transitions
    const validTransitions: Record<string, { by: 'student' | 'employer'; to: string[] }[]> = {
      pending: [
        { by: 'student', to: ['active'] },
        { by: 'employer', to: ['cancelled'] },
      ],
      active: [
        { by: 'student', to: ['delivered'] },
      ],
      delivered: [
        { by: 'employer', to: ['completed', 'revision_requested'] },
      ],
      revision_requested: [
        { by: 'student', to: ['delivered'] },
      ],
    };

    const isStudent = order.student.userId === userId;
    const isEmployer = order.employer.userId === userId;
    const role = isStudent ? 'student' : isEmployer ? 'employer' : null;

    if (!role) throw new ForbiddenException('Not your order');

    const transitions = validTransitions[order.status] || [];
    const allowed = transitions.find((t) => t.by === role && t.to.includes(status));

    if (!allowed)
      throw new BadRequestException(`Cannot transition from ${order.status} to ${status}`);

    const data: any = { status };
    if (status === 'revision_requested') {
      data.revisionCount = { increment: 1 };
    }

    return this.prisma.serviceOrder.update({ where: { id: orderId }, data });
  }

  async listMyOrders(userId: string, role: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: Prisma.ServiceOrderWhereInput = {};
    if (role === 'student') {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where.studentId = profile.id;
    } else {
      const profile = await this.prisma.employerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
      where.employerId = profile.id;
    }

    const [data, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          serviceListing: { select: { id: true, title: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
          employer: { select: { id: true, businessName: true, contactPerson: true } },
        },
      }),
      this.prisma.serviceOrder.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
