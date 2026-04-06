import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
  ) {}

  // ── Create a notification (called internally by other services) ──

  async create(params: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    data?: Record<string, any>;
    channel?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        body: params.body || null,
        data: params.data ?? {},
        channel: params.channel || 'in_app',
      },
    });

    // Push real-time via WebSocket
    try {
      this.gateway.emitNotification(params.userId, notification);
      const { unread } = await this.getUnreadCount(params.userId);
      this.gateway.emitUnreadCount(params.userId, unread);
    } catch (err) {
      this.logger.warn(`Failed to emit real-time notification: ${err}`);
    }

    return notification;
  }

  // ── Get user notifications (paginated) ──

  async list(userId: string, params: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (params.unreadOnly) {
      where.isRead = false;
    }
    if (params.type) {
      where.type = params.type;
    }

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Get unread count ──

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unread: count };
  }

  // ── Mark single notification as read ──

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException();

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // ── Mark all notifications as read ──

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { marked: result.count };
  }

  // ── Delete a single notification ──

  async delete(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException();

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });
    return { deleted: true };
  }

  // ── Delete all read notifications ──

  async deleteAllRead(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
    return { deleted: result.count };
  }
}
