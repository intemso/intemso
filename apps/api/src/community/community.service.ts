import { Injectable, Inject, forwardRef, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CommunityGateway } from './community.gateway';
import * as sanitizeHtml from 'sanitize-html';

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape',
};

function sanitize(input: string): string {
  return (sanitizeHtml as any).default
    ? (sanitizeHtml as any).default(input, sanitizeOptions).trim()
    : (sanitizeHtml as any)(input, sanitizeOptions).trim();
}

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    @Inject(forwardRef(() => CommunityGateway)) private gateway: CommunityGateway,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  // ── Helpers ──

  private getAuthorName(author: any): string {
    if (author.studentProfile) {
      return [author.studentProfile.firstName, author.studentProfile.lastName].filter(Boolean).join(' ') || 'Someone';
    }
    if (author.employerProfile) {
      return author.employerProfile.contactPerson || author.employerProfile.businessName || 'Someone';
    }
    return 'Someone';
  }

  private buildFeedWhere(params: { type?: string }) {
    const where: any = { isDeleted: false };
    if (params.type) where.type = params.type;
    return where;
  }

  private async fetchFeedFromDb(opts: { page: number; limit: number; skip: number; where: any; userId?: string }) {
    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where: opts.where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: opts.skip,
        take: opts.limit,
        include: {
          author: {
            select: {
              id: true, email: true, role: true, avatarUrl: true, reputationScore: true,
              studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
          gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
          _count: { select: { comments: true, likes: true } },
          likes: opts.userId ? { where: { userId: opts.userId }, select: { id: true } } : false,
        },
      }),
      this.prisma.communityPost.count({ where: opts.where }),
    ]);

    return {
      items: posts.map((post: any) => ({
        ...post,
        isLiked: opts.userId ? post.likes?.length > 0 : false,
        likes: undefined,
      })),
      total,
      page: opts.page,
      pages: Math.ceil(total / opts.limit),
    };
  }

  private async invalidateFeedCache() {
    const keys = [1, 2, 3].flatMap((p) => [
      `community:feed:anon:${p}:20:all`,
      `community:feed:anon:${p}:10:all`,
    ]);
    await Promise.all(keys.map((k) => this.cache.del(k)));
  }

  // ── Posts ──

  async createPost(authorId: string, data: { content: string; type?: string; images?: string[]; tags?: string[] }) {
    const post = await this.prisma.communityPost.create({
      data: {
        authorId,
        content: sanitize(data.content),
        type: (data.type as any) || 'discussion',
        images: data.images || [],
        tags: (data.tags || []).map((t) => sanitize(t).toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            reputationScore: true,
            studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
        gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    // Process @mentions
    await this.processMentions(post.content, authorId, post.id);

    // Broadcast to live feed
    this.gateway.emitNewPost(post);

    // Invalidate anonymous feed cache
    this.invalidateFeedCache().catch(() => {});

    // Recalculate author reputation (fire-and-forget)
    this.recalculateReputation(authorId).catch(() => {});

    return post;
  }

  async getFeed(params: { page?: number; limit?: number; type?: string; userId?: string; authorId?: string; followingIds?: string[] }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    // Cache anonymous feed pages (30-sec TTL)
    if (!params.userId && !params.authorId && !params.followingIds) {
      const cacheKey = `community:feed:anon:${page}:${limit}:${params.type || 'all'}`;
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) return cached;

      const result = await this.fetchFeedFromDb({ page, limit, skip, where: this.buildFeedWhere(params) });
      await this.cache.set(cacheKey, result, 30_000);
      return result;
    }

    const where: any = { isDeleted: false };
    if (params.type) where.type = params.type;
    if (params.authorId) where.authorId = params.authorId;

    // Filter to posts from followed users only
    if (params.followingIds) {
      where.authorId = { in: params.followingIds };
    }

    // Filter out posts from blocked users
    if (params.userId) {
      const blockedIds = await this.getBlockedIds(params.userId);
      if (blockedIds.length > 0) {
        if (where.authorId?.in) {
          // If filtering by followingIds, remove blocked users from that list
          where.authorId = { in: where.authorId.in.filter((id: string) => !blockedIds.includes(id)) };
        } else if (!where.authorId) {
          where.authorId = { notIn: blockedIds };
        }
      }
    }

    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              avatarUrl: true,
              reputationScore: true,
              studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
          gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
          _count: { select: { comments: true, likes: true } },
          likes: params.userId
            ? { where: { userId: params.userId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    return {
      items: posts.map((post: any) => ({
        ...post,
        isLiked: params.userId ? post.likes?.length > 0 : false,
        likes: undefined,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getPost(postId: string, userId?: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            reputationScore: true,
            studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
        gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
        _count: { select: { comments: true, likes: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    return {
      ...post,
      isLiked: userId ? (post as any).likes?.length > 0 : false,
      likes: undefined,
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    // Broadcast deletion to live feed
    this.gateway.emitPostDeleted(postId);

    return { deleted: true };
  }

  async updatePost(postId: string, userId: string, data: { content?: string; tags?: string[] }) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    // Only allow editing within 24 hours
    const hoursSinceCreation = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      throw new BadRequestException('Posts can only be edited within 24 hours of creation');
    }

    const updateData: any = { editedAt: new Date() };
    if (data.content !== undefined) {
      updateData.content = sanitize(data.content);
    }
    if (data.tags !== undefined) {
      updateData.tags = data.tags.map((t) => sanitize(t).toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);
    }

    const updated = await this.prisma.communityPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            reputationScore: true,
            studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
        gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    // Process @mentions in updated content
    if (data.content) {
      await this.processMentions(updated.content, userId, postId);
    }

    // Broadcast update to live feed
    this.gateway.emitPostUpdated(updated);

    return updated;
  }

  // ── Comments ──

  async createComment(postId: string, authorId: string, content: string, parentId?: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    // Check if commenter is blocked by post author
    if (post.authorId !== authorId) {
      const isBlocked = await this.blockedUser.findFirst({
        where: { blockerId: post.authorId, blockedId: authorId },
      });
      if (isBlocked) throw new ForbiddenException('You cannot comment on this post');
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.communityComment.create({
        data: { postId, authorId, content: sanitize(content), parentId: parentId || null },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              avatarUrl: true,
              reputationScore: true,
              studentProfile: { select: { firstName: true, lastName: true, university: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
        },
      }),
      this.prisma.communityPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    // Notify post author about new comment (don't notify yourself)
    if (post.authorId !== authorId) {
      const commenterName = this.getAuthorName(comment.author);
      if (parentId) {
        // It's a reply — also notify the parent comment author
        const parentComment = await this.prisma.communityComment.findUnique({ where: { id: parentId } });
        if (parentComment && parentComment.authorId !== authorId) {
          this.notifications.create({
            userId: parentComment.authorId,
            type: 'community_reply',
            title: `${commenterName} replied to your comment`,
            body: sanitize(content).slice(0, 120),
            data: { postId, commentId: comment.id },
          }).catch(() => {});
        }
      }
      this.notifications.create({
        userId: post.authorId,
        type: 'community_comment',
        title: `${commenterName} commented on your post`,
        body: sanitize(content).slice(0, 120),
        data: { postId, commentId: comment.id },
      }).catch(() => {});
    } else if (parentId) {
      // Author commenting on own post but replying to someone else's comment
      const parentComment = await this.prisma.communityComment.findUnique({ where: { id: parentId } });
      if (parentComment && parentComment.authorId !== authorId) {
        const commenterName = this.getAuthorName(comment.author);
        this.notifications.create({
          userId: parentComment.authorId,
          type: 'community_reply',
          title: `${commenterName} replied to your comment`,
          body: sanitize(content).slice(0, 120),
          data: { postId, commentId: comment.id },
        }).catch(() => {});
      }
    }

    // Process @mentions in comment
    this.processMentions(comment.content, authorId, postId).catch(() => {});

    // Broadcast new comment to post room
    this.gateway.emitNewComment(postId, { ...comment, _count: { likes: 0 } });

    // Recalculate post author reputation (fire-and-forget)
    this.recalculateReputation(post.authorId).catch(() => {});

    return comment;
  }
  async getComments(postId: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.communityComment.findMany({
        where: { postId, parentId: null, isDeleted: false },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              avatarUrl: true,
              studentProfile: { select: { firstName: true, lastName: true, university: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
          replies: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'asc' },
            take: 3,
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  avatarUrl: true,
                  studentProfile: { select: { firstName: true, lastName: true, university: true } },
                  employerProfile: { select: { businessName: true, contactPerson: true } },
                },
              },
            },
          },
          _count: { select: { replies: true } },
        },
      }),
      this.prisma.communityComment.count({ where: { postId, parentId: null, isDeleted: false } }),
    ]);

    return { items: comments, total, page, pages: Math.ceil(total / limit) };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.communityComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not your comment');

    await this.prisma.$transaction([
      this.prisma.communityComment.update({
        where: { id: commentId },
        data: { isDeleted: true },
      }),
      this.prisma.communityPost.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    return { deleted: true };
  }

  // ── Likes ──

  async toggleLikePost(postId: string, userId: string) {
    const existing = await this.prisma.communityLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.communityLike.delete({ where: { id: existing.id } }),
        this.prisma.communityPost.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const after = await this.prisma.communityPost.findUnique({ where: { id: postId }, select: { likeCount: true, authorId: true } });
      if (after) {
        this.gateway.emitLikeUpdated(postId, after.likeCount);
        this.recalculateReputation(after.authorId).catch(() => {});
      }
      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.communityLike.create({ data: { userId, postId } }),
      this.prisma.communityPost.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    // Notify post author about the like (don't notify yourself)
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            studentProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
      },
    });
    if (post && post.authorId !== userId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          studentProfile: { select: { firstName: true, lastName: true } },
          employerProfile: { select: { businessName: true, contactPerson: true } },
        },
      });
      const likerName = this.getAuthorName(liker);
      this.notifications.create({
        userId: post.authorId,
        type: 'community_like',
        title: `${likerName} liked your post`,
        body: post.content.slice(0, 80),
        data: { postId },
      }).catch(() => {});
    }

    // Broadcast like count to feed
    const updatedPost = await this.prisma.communityPost.findUnique({ where: { id: postId }, select: { likeCount: true, authorId: true } });
    if (updatedPost) {
      this.gateway.emitLikeUpdated(postId, updatedPost.likeCount);
      // Recalculate post author reputation (fire-and-forget)
      this.recalculateReputation(updatedPost.authorId).catch(() => {});
    }

    return { liked: true };
  }

  async toggleLikeComment(commentId: string, userId: string) {
    const existing = await this.prisma.communityLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.communityLike.delete({ where: { id: existing.id } }),
        this.prisma.communityComment.update({
          where: { id: commentId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      const afterComment = await this.prisma.communityComment.findUnique({ where: { id: commentId }, select: { likeCount: true } });
      if (afterComment) this.gateway.emitCommentLikeUpdated(commentId, afterComment.likeCount);
      return { liked: false };
    }

    await this.prisma.$transaction([
      this.prisma.communityLike.create({ data: { userId, commentId } }),
      this.prisma.communityComment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    // Notify comment author about the like (don't notify yourself)
    const comment = await this.prisma.communityComment.findUnique({ where: { id: commentId } });
    if (comment && comment.authorId !== userId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          studentProfile: { select: { firstName: true, lastName: true } },
          employerProfile: { select: { businessName: true, contactPerson: true } },
        },
      });
      const likerName = this.getAuthorName(liker);
      this.notifications.create({
        userId: comment.authorId,
        type: 'community_like',
        title: `${likerName} liked your comment`,
        body: comment.content.slice(0, 80),
        data: { postId: comment.postId, commentId },
      }).catch(() => {});
    }

    // Broadcast comment like count
    const updatedComment = await this.prisma.communityComment.findUnique({ where: { id: commentId }, select: { likeCount: true } });
    if (updatedComment) this.gateway.emitCommentLikeUpdated(commentId, updatedComment.likeCount);

    return { liked: true };
  }

  // ── Reports ──

  async reportPost(postId: string, userId: string, reason: string, description?: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');
    if (post.authorId === userId) throw new ForbiddenException('You cannot report your own post');

    const existing = await this.prisma.report.findFirst({
      where: { reporterId: userId, reportedEntity: 'community_post', reportedId: postId },
    });
    if (existing) throw new ConflictException('You have already reported this post');

    return this.prisma.report.create({
      data: {
        reporterId: userId,
        reportedEntity: 'community_post',
        reportedId: postId,
        reason: description ? `${reason}: ${sanitize(description)}` : reason,
      },
    });
  }

  async reportComment(commentId: string, userId: string, reason: string, description?: string) {
    const comment = await this.prisma.communityComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.isDeleted) throw new NotFoundException('Comment not found');
    if (comment.authorId === userId) throw new ForbiddenException('You cannot report your own comment');

    const existing = await this.prisma.report.findFirst({
      where: { reporterId: userId, reportedEntity: 'community_comment', reportedId: commentId },
    });
    if (existing) throw new ConflictException('You have already reported this comment');

    return this.prisma.report.create({
      data: {
        reporterId: userId,
        reportedEntity: 'community_comment',
        reportedId: commentId,
        reason: description ? `${reason}: ${sanitize(description)}` : reason,
      },
    });
  }

  // ── Block ──

  // Note: prisma.blockedUser types available after Prisma client regeneration
  private get blockedUser() {
    return (this.prisma as any).blockedUser;
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new ForbiddenException('You cannot block yourself');

    const blocked = await this.prisma.user.findUnique({ where: { id: blockedId } });
    if (!blocked) throw new NotFoundException('User not found');

    const existing = await this.blockedUser.findFirst({
      where: { blockerId, blockedId },
    });
    if (existing) throw new ConflictException('User already blocked');

    await this.blockedUser.create({ data: { blockerId, blockedId } });
    return { blocked: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const existing = await this.blockedUser.findFirst({
      where: { blockerId, blockedId },
    });
    if (!existing) throw new NotFoundException('User is not blocked');

    await this.blockedUser.delete({ where: { id: existing.id } });
    return { blocked: false };
  }

  async getBlockedUsers(userId: string) {
    const blocks = await this.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            avatarUrl: true,
            studentProfile: { select: { firstName: true, lastName: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return blocks.map((b: any) => ({
      id: b.blockedId,
      blockedAt: b.createdAt,
      ...b.blocked,
    }));
  }

  /** Get IDs of users that this user has blocked */
  async getBlockedIds(userId: string): Promise<string[]> {
    const blocks = await this.blockedUser.findMany({
      where: { blockerId: userId },
      select: { blockedId: true },
    });
    return blocks.map((b: any) => b.blockedId);
  }

  // ── Search ──

  async search(params: {
    q: string;
    type?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const where: any = { isDeleted: false };

    // Build search conditions
    const searchTerms = params.q
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    where.OR = [
      { content: { contains: params.q, mode: 'insensitive' } },
      { tags: { hasSome: searchTerms } },
    ];

    if (params.type) where.type = params.type;
    if (params.tags?.length) {
      where.AND = [{ tags: { hasSome: params.tags } }];
    }

    // Filter blocked users
    if (params.userId) {
      const blockedIds = await this.getBlockedIds(params.userId);
      if (blockedIds.length > 0) {
        where.authorId = { notIn: blockedIds };
      }
    }

    const [posts, total] = await Promise.all([
      this.prisma.communityPost.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              role: true,
              avatarUrl: true,
              reputationScore: true,
              studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
          gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
          _count: { select: { comments: true, likes: true } },
          likes: params.userId
            ? { where: { userId: params.userId }, select: { id: true } }
            : false,
        },
      }),
      this.prisma.communityPost.count({ where }),
    ]);

    return {
      items: posts.map((post: any) => ({
        ...post,
        isLiked: params.userId ? post.likes?.length > 0 : false,
        likes: undefined,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ── Auto-Generated Posts (Gig-Community Bridge) ──

  async createAutoPost(data: {
    authorId: string;
    type: 'gig_posted' | 'gig_completed' | 'review_received';
    content: string;
    gigId?: string;
    tags?: string[];
  }) {
    return this.prisma.communityPost.create({
      data: {
        authorId: data.authorId,
        type: data.type as any,
        content: sanitize(data.content),
        gigId: data.gigId,
        tags: (data.tags || []).map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean),
      },
    });
  }

  async createGigDiscussion(gigId: string, authorId: string) {
    // Check if a discussion already exists for this gig
    const existing = await this.prisma.communityPost.findFirst({
      where: { gigId, type: 'discussion' as any, isDeleted: false },
      select: { id: true },
    });
    if (existing) {
      return { postId: existing.id, alreadyExists: true };
    }

    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      select: {
        title: true,
        requiredSkills: true,
        employer: { select: { businessName: true } },
      },
    });
    if (!gig) throw new NotFoundException('Gig not found');

    const post = await this.prisma.communityPost.create({
      data: {
        authorId,
        type: 'discussion' as any,
        content: `💬 Discussion: "${gig.title}"\n\nLet's discuss this gig posted by ${gig.employer.businessName}. Share your thoughts, ask questions, or connect with others interested in this opportunity!`,
        gigId,
        tags: gig.requiredSkills.slice(0, 5).map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean),
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            role: true,
            avatarUrl: true,
            studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
            employerProfile: { select: { businessName: true, contactPerson: true } },
          },
        },
        _count: { select: { comments: true, likes: true } },
      },
    });

    return { postId: post.id, alreadyExists: false, post };
  }

  async getGigDiscussionId(gigId: string): Promise<string | null> {
    const post = await this.prisma.communityPost.findFirst({
      where: { gigId, isDeleted: false },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    return post?.id || null;
  }

  async crossPostGig(gigId: string, authorId: string) {
    // Check if already cross-posted
    const existing = await this.prisma.communityPost.findFirst({
      where: { gigId, type: 'gig_posted' as any, isDeleted: false },
      select: { id: true },
    });
    if (existing) {
      return { postId: existing.id, alreadyExists: true };
    }

    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      select: {
        title: true,
        description: true,
        budgetType: true,
        budgetMin: true,
        budgetMax: true,
        currency: true,
        requiredSkills: true,
        employer: { select: { businessName: true } },
      },
    });
    if (!gig) throw new NotFoundException('Gig not found');

    const budgetStr = gig.budgetMin && gig.budgetMax
      ? `${gig.currency} ${gig.budgetMin}-${gig.budgetMax}`
      : gig.budgetMin
        ? `From ${gig.currency} ${gig.budgetMin}`
        : gig.budgetMax
          ? `Up to ${gig.currency} ${gig.budgetMax}`
          : 'Negotiable';

    const snippet = gig.description.length > 150
      ? gig.description.substring(0, 150) + '...'
      : gig.description;

    const post = await this.prisma.communityPost.create({
      data: {
        authorId,
        type: 'gig_posted' as any,
        content: `📢 New Gig: "${gig.title}"\n\n${snippet}\n\n💰 Budget: ${budgetStr}\n🏢 Posted by: ${gig.employer.businessName}`,
        gigId,
        tags: gig.requiredSkills.slice(0, 5).map((s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean),
      },
    });

    return { postId: post.id, alreadyExists: false };
  }

  // ── Trending Tags ──

  async getTrendingTags(days = 7, limit = 10) {
    const cacheKey = `community:trending:${days}:${limit}`;
    const cached = await this.cache.get<{ tag: string; count: number }[]>(cacheKey);
    if (cached) return cached;

    const since = new Date();
    since.setDate(since.getDate() - days);

    const result: { tag: string; count: bigint }[] = await this.prisma.$queryRaw`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM community_posts
      WHERE created_at >= ${since}
        AND is_deleted = false
        AND array_length(tags, 1) > 0
      GROUP BY tag
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    const tags = result.map((r) => ({
      tag: r.tag,
      count: Number(r.count),
    }));

    await this.cache.set(cacheKey, tags, 300_000); // 5-minute TTL
    return tags;
  }

  // ── Saved Posts ──

  async toggleSavePost(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    const existing = await (this.prisma as any).savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await (this.prisma as any).savedPost.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    await (this.prisma as any).savedPost.create({
      data: { userId, postId },
    });
    return { saved: true };
  }

  async getSavedPosts(userId: string, params: { page?: number; limit?: number } = {}) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const skip = (page - 1) * limit;

    const [saves, total] = await Promise.all([
      (this.prisma as any).savedPost.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  avatarUrl: true,
                  reputationScore: true,
                  studentProfile: { select: { firstName: true, lastName: true, university: true, professionalTitle: true } },
                  employerProfile: { select: { businessName: true, contactPerson: true } },
                },
              },
              gig: { select: { id: true, title: true, budgetMin: true, budgetMax: true, currency: true, status: true, requiredSkills: true } },
              _count: { select: { comments: true, likes: true } },
              likes: { where: { userId }, select: { id: true } },
            },
          },
        },
      }),
      (this.prisma as any).savedPost.count({ where: { userId } }),
    ]);

    return {
      items: saves
        .filter((s: any) => s.post && !s.post.isDeleted)
        .map((s: any) => ({
          ...s.post,
          savedAt: s.createdAt,
          isLiked: s.post.likes?.length > 0,
          isSaved: true,
          likes: undefined,
        })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  // ── @Mentions ──

  private parseMentions(content: string): string[] {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)];
  }

  async processMentions(content: string, authorId: string, postId: string) {
    const usernames = this.parseMentions(content);
    if (usernames.length === 0) return;

    // Look up users by email prefix or name match
    // We'll match against email usernames (part before @)
    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: authorId } },
          { isActive: true },
          {
            OR: usernames.map((name) => ({
              OR: [
                { email: { startsWith: name, mode: 'insensitive' as const } },
                { studentProfile: { OR: [{ firstName: { equals: name, mode: 'insensitive' as const } }, { lastName: { equals: name, mode: 'insensitive' as const } }] } },
              ],
            })),
          },
        ],
      },
      select: { id: true },
      take: 10,
    });

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        studentProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { businessName: true, contactPerson: true } },
      },
    });
    const authorName = author ? this.getAuthorName(author) : 'Someone';

    for (const user of users) {
      await this.notifications.create({
        userId: user.id,
        type: 'community_mention',
        title: 'You were mentioned in a post',
        body: `${authorName} mentioned you in a community post`,
        data: { postId },
      });
    }
  }

  async searchUsers(query: string, limit = 5) {
    if (!query || query.length < 2) return [];

    return this.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { email: { startsWith: query, mode: 'insensitive' } },
          { studentProfile: { firstName: { startsWith: query, mode: 'insensitive' } } },
          { studentProfile: { lastName: { startsWith: query, mode: 'insensitive' } } },
          { employerProfile: { businessName: { startsWith: query, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        avatarUrl: true,
        studentProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { businessName: true } },
      },
      take: limit,
    });
  }

  // ── View Tracking ──

  async recordView(postId: string, userId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, isDeleted: true, authorId: true },
    });
    if (!post || post.isDeleted) throw new NotFoundException('Post not found');

    // Don't count self-views
    if (post.authorId === userId) return { viewed: false };

    // Upsert — only count first view per user per post
    const existing = await (this.prisma as any).communityPostView.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) return { viewed: false };

    await (this.prisma as any).communityPostView.create({
      data: { userId, postId },
    });

    // Increment viewCount
    await this.prisma.communityPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    return { viewed: true };
  }

  // ── Reputation ──

  async getReputation(userId: string) {
    const cacheKey = `community:reputation:${userId}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { reputationScore: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const result = {
      score: user.reputationScore,
      tier: this.getReputationTier(user.reputationScore),
    };

    await this.cache.set(cacheKey, result, 60_000); // 1-min cache
    return result;
  }

  async recalculateReputation(userId: string) {
    // Points: posts ×5, likes received ×2, comments received ×3, views ×0.1
    const [postCount, likesReceived, commentsReceived, viewsReceived] = await Promise.all([
      this.prisma.communityPost.count({ where: { authorId: userId, isDeleted: false } }),
      this.prisma.communityPost.aggregate({
        where: { authorId: userId, isDeleted: false },
        _sum: { likeCount: true },
      }),
      this.prisma.communityPost.aggregate({
        where: { authorId: userId, isDeleted: false },
        _sum: { commentCount: true },
      }),
      this.prisma.communityPost.aggregate({
        where: { authorId: userId, isDeleted: false },
        _sum: { viewCount: true },
      }),
    ]);

    const score = Math.floor(
      postCount * 5 +
      (likesReceived._sum?.likeCount || 0) * 2 +
      (commentsReceived._sum?.commentCount || 0) * 3 +
      (viewsReceived._sum?.viewCount || 0) * 0.1,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { reputationScore: score },
    });

    // Invalidate cache
    await this.cache.del(`community:reputation:${userId}`);

    return { score, tier: this.getReputationTier(score) };
  }

  private getReputationTier(score: number): { name: string; level: number } {
    if (score >= 1000) return { name: 'Leader', level: 5 };
    if (score >= 500) return { name: 'Expert', level: 4 };
    if (score >= 200) return { name: 'Contributor', level: 3 };
    if (score >= 50) return { name: 'Active', level: 2 };
    return { name: 'Newcomer', level: 1 };
  }

  // ── Analytics (Admin) ──

  async getCommunityAnalytics() {
    const cacheKey = 'admin:community-analytics';
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [
      totalPosts,
      totalComments,
      totalLikes,
      totalViews,
      postsToday,
      postsWeek,
      postsMonth,
      commentsToday,
      commentsWeek,
      commentsMonth,
      activeUsersWeek,
      topPosts,
      topContributors,
      dailyPostCounts,
    ] = await Promise.all([
      this.prisma.communityPost.count({ where: { isDeleted: false } }),
      this.prisma.communityComment.count({ where: { isDeleted: false } }),
      this.prisma.communityLike.count(),
      this.prisma.communityPost.aggregate({ where: { isDeleted: false }, _sum: { viewCount: true } }),
      this.prisma.communityPost.count({ where: { isDeleted: false, createdAt: { gte: oneDayAgo } } }),
      this.prisma.communityPost.count({ where: { isDeleted: false, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.communityPost.count({ where: { isDeleted: false, createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.communityComment.count({ where: { isDeleted: false, createdAt: { gte: oneDayAgo } } }),
      this.prisma.communityComment.count({ where: { isDeleted: false, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.communityComment.count({ where: { isDeleted: false, createdAt: { gte: thirtyDaysAgo } } }),
      // Unique users who posted or commented in the last 7 days
      this.prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT author_id) as count FROM (
          SELECT author_id FROM community_posts WHERE created_at >= ${sevenDaysAgo} AND is_deleted = false
          UNION ALL
          SELECT author_id FROM community_comments WHERE created_at >= ${sevenDaysAgo} AND is_deleted = false
        ) sub
      `,
      // Top 10 most engaged posts (by likes+comments+views)
      this.prisma.communityPost.findMany({
        where: { isDeleted: false },
        orderBy: [{ likeCount: 'desc' }, { commentCount: 'desc' }],
        take: 10,
        select: {
          id: true,
          content: true,
          type: true,
          likeCount: true,
          commentCount: true,
          viewCount: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              avatarUrl: true,
              studentProfile: { select: { firstName: true, lastName: true } },
              employerProfile: { select: { businessName: true } },
            },
          },
        },
      }),
      // Top 10 contributors by reputation
      this.prisma.user.findMany({
        where: { isActive: true, reputationScore: { gt: 0 } },
        orderBy: { reputationScore: 'desc' },
        take: 10,
        select: {
          id: true,
          avatarUrl: true,
          reputationScore: true,
          studentProfile: { select: { firstName: true, lastName: true } },
          employerProfile: { select: { businessName: true } },
        },
      }),
      // Daily post counts for last 30 days
      this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM community_posts
        WHERE created_at >= ${thirtyDaysAgo} AND is_deleted = false
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    const result = {
      overview: {
        totalPosts,
        totalComments,
        totalLikes,
        totalViews: Number(totalViews._sum?.viewCount || 0),
      },
      activity: {
        posts: { today: postsToday, week: postsWeek, month: postsMonth },
        comments: { today: commentsToday, week: commentsWeek, month: commentsMonth },
        activeUsersWeek: Number(activeUsersWeek[0]?.count || 0),
      },
      topPosts: topPosts.map((p) => ({
        ...p,
        content: p.content.length > 100 ? p.content.substring(0, 100) + '...' : p.content,
      })),
      topContributors,
      dailyPostCounts: dailyPostCounts.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
    };

    await this.cache.set(cacheKey, result, 120_000); // 2-min cache
    return result;
  }
}
