import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConnectsService } from '../connects/connects.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly connectsService: ConnectsService,
  ) {}

  // ── Public Profile ──

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true, isSuspended: false },
      select: {
        id: true,
        role: true,
        avatarUrl: true,
        bannerUrl: true,
        createdAt: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            professionalTitle: true,
            bio: true,
            university: true,
            major: true,
            skills: true,
            hourlyRate: true,
            ratingAvg: true,
            ratingCount: true,
            gigsCompleted: true,
            totalEarned: true,
            jobSuccessScore: true,
            talentBadge: true,
            onTimeRate: true,
            isVerified: true,
            portfolioUrls: true,
          },
        },
        employerProfile: {
          select: {
            businessName: true,
            businessType: true,
            description: true,
            website: true,
            contactPerson: true,
            ratingAvg: true,
            ratingCount: true,
            gigsPosted: true,
            totalSpent: true,
            hireRate: true,
            isVerified: true,
          },
        },
        reviewsReceived: {
          where: { isVisible: true, isFlagged: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                avatarUrl: true,
                role: true,
                studentProfile: { select: { firstName: true, lastName: true } },
                employerProfile: { select: { businessName: true, contactPerson: true } },
              },
            },
          },
        },
        _count: {
          select: {
            communityPosts: true,
            reviewsReceived: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // ── Media (avatar / banner) ──

  async updateMedia(userId: string, data: { avatarUrl?: string; bannerUrl?: string }) {
    const update: Record<string, string> = {};
    if (data.avatarUrl !== undefined) update.avatarUrl = data.avatarUrl;
    if (data.bannerUrl !== undefined) update.bannerUrl = data.bannerUrl;

    return this.prisma.user.update({
      where: { id: userId },
      data: update,
      select: { id: true, avatarUrl: true, bannerUrl: true },
    });
  }

  // ── Internal lookups ──

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByGhanaCard(ghanaCardNumber: string) {
    return this.prisma.user.findUnique({ where: { ghanaCardNumber } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email?: string; ghanaCardNumber?: string; passwordHash: string; role: string }) {
    return this.prisma.user.create({
      data: {
        email: data.email || undefined,
        ghanaCardNumber: data.ghanaCardNumber || undefined,
        passwordHash: data.passwordHash,
        role: data.role as any,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        avatarUrl: true,
        bannerUrl: true,
        emailVerified: true,
        createdAt: true,
        studentProfile: true,
        employerProfile: true,
      },
    });
  }

  async updateStudentProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      university?: string;
      bio?: string;
      professionalTitle?: string;
      major?: string;
      skills?: string[];
      hourlyRate?: number;
    },
  ) {
    const profile = await this.prisma.studentProfile.upsert({
      where: { userId },
      update: data as any,
      create: {
        userId,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        university: data.university || '',
        ...data,
      } as any,
    });

    // Check if profile is now "complete" and award connects (one-time)
    if (profile.firstName && profile.lastName && profile.university && profile.bio && profile.skills?.length > 0) {
      this.connectsService.rewardProfileComplete(profile.id).catch(() => {});
    }

    return profile;
  }

  async updateEmployerProfile(
    userId: string,
    data: {
      businessName?: string;
      businessType?: string;
      description?: string;
      website?: string;
      phone?: string;
      contactPerson?: string;
    },
  ) {
    return this.prisma.employerProfile.upsert({
      where: { userId },
      update: data as any,
      create: {
        userId,
        businessName: data.businessName || '',
        ...data,
      } as any,
    });
  }

  // ── Suggested Connections ──

  async getSuggestions(userId: string, limit = 6) {
    // Get current user's profile for matching
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        studentProfile: { select: { university: true, skills: true } },
      },
    });

    if (!currentUser) return [];

    const university = currentUser.studentProfile?.university;
    const skills = currentUser.studentProfile?.skills || [];

    // Get blocked user IDs to exclude
    const blocks = await (this.prisma as any).blockedUser.findMany({
      where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
      select: { blockerId: true, blockedId: true },
    });
    const blockedIds = blocks.map((b: any) =>
      b.blockerId === userId ? b.blockedId : b.blockerId,
    );
    const excludeIds = [userId, ...blockedIds];

    // Find active community users — prioritize same university, shared skills
    const suggestions = await this.prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        isActive: true,
        isSuspended: false,
        communityPosts: { some: {} }, // Must have at least one post
      },
      select: {
        id: true,
        role: true,
        avatarUrl: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            professionalTitle: true,
            skills: true,
          },
        },
        employerProfile: {
          select: { businessName: true, contactPerson: true },
        },
        _count: { select: { communityPosts: true } },
      },
      take: limit * 3, // Over-fetch to score & rank
    });

    // Score and sort: same university +3, shared skill +1 each, more posts +0.5
    const scored = suggestions
      .map((u) => {
        let score = 0;
        if (university && u.studentProfile?.university === university) score += 3;
        const userSkills = u.studentProfile?.skills || [];
        score += skills.filter((s: string) => userSkills.includes(s)).length;
        score += Math.min((u._count?.communityPosts || 0) * 0.1, 2);
        return { ...u, _count: undefined, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map(({ score, ...user }) => user);
  }

  // ── Follow System ──

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself');

    // Check target user exists
    const target = await this.prisma.user.findUnique({
      where: { id: followingId, isActive: true, isSuspended: false },
      select: {
        id: true,
        studentProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { businessName: true, contactPerson: true } },
      },
    });
    if (!target) throw new NotFoundException('User not found');

    try {
      await this.prisma.userFollow.create({
        data: { followerId, followingId },
      });
    } catch (err: any) {
      if (err.code === 'P2002') throw new ConflictException('Already following this user');
      throw err;
    }

    // Get follower name for notification
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: {
        studentProfile: { select: { firstName: true, lastName: true } },
        employerProfile: { select: { businessName: true, contactPerson: true } },
      },
    });
    const followerName = follower?.studentProfile
      ? `${follower.studentProfile.firstName} ${follower.studentProfile.lastName}`.trim()
      : follower?.employerProfile?.contactPerson || follower?.employerProfile?.businessName || 'Someone';

    this.notifications.create({
      userId: followingId,
      type: 'user_followed',
      title: 'New Follower',
      body: `${followerName} started following you`,
      data: { followerId },
    }).catch(() => {});

    return { following: true };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const record = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!record) throw new NotFoundException('Not following this user');

    await this.prisma.userFollow.delete({
      where: { id: record.id },
    });

    return { following: false };
  }

  async getFollowers(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { followingId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          createdAt: true,
          follower: {
            select: {
              id: true,
              avatarUrl: true,
              role: true,
              studentProfile: { select: { firstName: true, lastName: true, professionalTitle: true, university: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
        },
      }),
      this.prisma.userFollow.count({ where: { followingId: userId } }),
    ]);

    return {
      items: items.map((i) => ({ ...i.follower, followedAt: i.createdAt })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getFollowing(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { followerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          createdAt: true,
          following: {
            select: {
              id: true,
              avatarUrl: true,
              role: true,
              studentProfile: { select: { firstName: true, lastName: true, professionalTitle: true, university: true } },
              employerProfile: { select: { businessName: true, contactPerson: true } },
            },
          },
        },
      }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    return {
      items: items.map((i) => ({ ...i.following, followedAt: i.createdAt })),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const record = await this.prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
      select: { id: true },
    });
    return !!record;
  }

  async getFollowCounts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.userFollow.count({ where: { followingId: userId } }),
      this.prisma.userFollow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const follows = await this.prisma.userFollow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    return follows.map((f) => f.followingId);
  }
}
