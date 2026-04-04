import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagingGateway } from './messaging.gateway';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly gateway: MessagingGateway,
  ) {}

  // ── Start or find conversation ──

  async createConversation(userId: string, dto: CreateConversationDto) {
    // Validate the other participant exists
    const otherUser = await this.prisma.user.findUnique({
      where: { id: dto.participantId },
    });
    if (!otherUser) throw new NotFoundException('User not found');
    if (dto.participantId === userId) {
      throw new BadRequestException('Cannot start conversation with yourself');
    }

    // Check for existing conversation between these users (optionally same gig)
    const existing = await this.prisma.conversation.findFirst({
      where: {
        participantIds: { hasEvery: [userId, dto.participantId] },
        ...(dto.gigId ? { gigId: dto.gigId } : {}),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (existing) {
      // If initial message, send it in the existing conversation
      if (dto.message) {
        await this.sendMessage(userId, existing.id, { content: dto.message });
      }
      return this.getConversationWithDetails(existing.id, userId);
    }

    // Create new conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        participantIds: [userId, dto.participantId],
        gigId: dto.gigId || null,
      },
    });

    // Send initial message if provided
    if (dto.message) {
      await this.sendMessage(userId, conversation.id, { content: dto.message });
    }

    return this.getConversationWithDetails(conversation.id, userId);
  }

  // ── List conversations ──

  async listConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participantIds: { has: userId },
      },
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      include: {
        gig: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
    });

    // Enrich with participant info and unread count
    const enriched = await Promise.all(
      conversations.map(async (convo) => {
        const otherParticipantId = convo.participantIds.find((id) => id !== userId);
        const otherUser = otherParticipantId
          ? await this.prisma.user.findUnique({
              where: { id: otherParticipantId },
              select: {
                id: true,
                email: true,
                role: true,
                studentProfile: { select: { firstName: true, lastName: true } },
                employerProfile: { select: { businessName: true, contactPerson: true, logoUrl: true } },
              },
            })
          : null;

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: convo.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        const lastMessage = convo.messages[0] || null;

        return {
          id: convo.id,
          gigId: convo.gigId,
          gig: convo.gig,
          lastMessageAt: convo.lastMessageAt,
          createdAt: convo.createdAt,
          lastMessage,
          unreadCount,
          participant: otherUser
            ? {
                id: otherUser.id,
                role: otherUser.role,
                name:
                  otherUser.role === 'student'
                    ? `${otherUser.studentProfile?.firstName ?? ''} ${otherUser.studentProfile?.lastName ?? ''}`.trim()
                    : otherUser.employerProfile?.businessName || otherUser.employerProfile?.contactPerson || otherUser.email || 'Unknown',
                avatar:
                  otherUser.role === 'student'
                    ? `${(otherUser.studentProfile?.firstName?.[0] ?? '')}${(otherUser.studentProfile?.lastName?.[0] ?? '')}`
                    : (otherUser.employerProfile?.businessName?.[0] ?? otherUser.email?.[0] ?? 'U').toUpperCase(),
              }
            : null,
        };
      }),
    );

    return enriched;
  }

  // ── Get messages for a conversation ──

  async getMessages(userId: string, conversationId: string, params: { page?: number; limit?: number }) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (!convo.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          attachments: true,
          isRead: true,
          createdAt: true,
        },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark unread messages from the other user as read
    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      data: data.reverse(), // oldest first for display
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Send a message ──

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (!convo.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: dto.content,
          attachments: dto.attachments ?? [],
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Notify the other participant
    const recipientId = convo.participantIds.find((id) => id !== userId);
    if (recipientId) {
      this.notificationsService.create({
        userId: recipientId,
        type: 'new_message',
        title: 'New Message',
        body: dto.content.length > 100 ? dto.content.substring(0, 100) + '...' : dto.content,
        data: { conversationId, messageId: message.id },
      }).catch(() => {});
    }

    // Emit real-time event
    this.gateway.emitNewMessage(conversationId, message);

    return message;
  }

  // ── Mark messages as read ──

  async markAsRead(userId: string, conversationId: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (!convo.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const result = await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { marked: result.count };
  }

  // ── Helper: get conversation with enriched details ──

  private async getConversationWithDetails(conversationId: string, userId: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        gig: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!convo) throw new NotFoundException('Conversation not found');

    const otherParticipantId = convo.participantIds.find((id) => id !== userId);
    const otherUser = otherParticipantId
      ? await this.prisma.user.findUnique({
          where: { id: otherParticipantId },
          select: {
            id: true,
            email: true,
            role: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        })
      : null;

    return {
      id: convo.id,
      gigId: convo.gigId,
      gig: convo.gig,
      lastMessageAt: convo.lastMessageAt,
      createdAt: convo.createdAt,
      lastMessage: convo.messages[0] || null,
      participant: otherUser
        ? {
            id: otherUser.id,
            role: otherUser.role,
            name:
              otherUser.role === 'student'
                ? `${otherUser.studentProfile?.firstName ?? ''} ${otherUser.studentProfile?.lastName ?? ''}`.trim()
                : otherUser.employerProfile?.businessName || otherUser.employerProfile?.contactPerson || otherUser.email,
          }
        : null,
    };
  }
}
