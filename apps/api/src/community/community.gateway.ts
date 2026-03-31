import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    credentials: true,
  },
  namespace: '/community',
})
export class CommunityGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CommunityGateway.name);

  // userId → set of socket IDs (multi-tab support)
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub;
      (client as any).userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join personal room for targeted events
      client.join(`user:${userId}`);
      // Join the global community feed room
      client.join('community:feed');

      this.logger.debug(`User ${userId} connected to community (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
      this.logger.debug(`User ${userId} disconnected from community (${client.id})`);
    }
  }

  // ── Client subscribes to a specific post for live comment/like updates ──

  @SubscribeMessage('join_post')
  handleJoinPost(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string },
  ) {
    if (data?.postId) {
      client.join(`post:${data.postId}`);
    }
  }

  @SubscribeMessage('leave_post')
  handleLeavePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string },
  ) {
    if (data?.postId) {
      client.leave(`post:${data.postId}`);
    }
  }

  // ── Typing indicator for comments ──

  @SubscribeMessage('typing_comment')
  handleTypingComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string },
  ) {
    const userId = (client as any).userId;
    if (userId && data?.postId) {
      client.to(`post:${data.postId}`).emit('user_typing', {
        postId: data.postId,
        userId,
      });
    }
  }

  // ── Server-side emitters (called from CommunityService) ──

  emitNewPost(post: any) {
    this.server.to('community:feed').emit('new_post', post);
  }

  emitPostUpdated(post: any) {
    this.server.to('community:feed').emit('post_updated', post);
  }

  emitPostDeleted(postId: string) {
    this.server.to('community:feed').emit('post_deleted', { postId });
  }

  emitNewComment(postId: string, comment: any) {
    this.server.to(`post:${postId}`).emit('new_comment', { postId, comment });
    // Also broadcast the updated comment count to the feed
    this.server.to('community:feed').emit('comment_count_updated', {
      postId,
      commentCount: comment._count ?? undefined,
    });
  }

  emitLikeUpdated(postId: string, likeCount: number) {
    this.server.to('community:feed').emit('like_updated', { postId, likeCount });
    this.server.to(`post:${postId}`).emit('like_updated', { postId, likeCount });
  }

  emitCommentLikeUpdated(commentId: string, likeCount: number) {
    this.server.emit('comment_like_updated', { commentId, likeCount });
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
