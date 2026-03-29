import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommunityService } from './community.service';
import { UsersService } from '../users/users.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportContentDto } from './dto/report-content.dto';

@Controller('community')
@UseGuards(ThrottlerGuard)
export class CommunityController {
  constructor(
    private communityService: CommunityService,
    private usersService: UsersService,
  ) {}

  // ── Feed (public, with auth-enhanced data) ──

  @Get('feed')
  async getFeed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.communityService.getFeed({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
    });
  }

  @Get('feed/me')
  @UseGuards(JwtAuthGuard)
  async getAuthFeed(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.communityService.getFeed({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
      userId: user.id,
    });
  }

  @Get('feed/following')
  @UseGuards(JwtAuthGuard)
  async getFollowingFeed(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    const followingIds = await this.usersService.getFollowingIds(user.id);
    return this.communityService.getFeed({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
      userId: user.id,
      followingIds,
    });
  }

  @Get('feed/user/:userId')
  async getUserFeed(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getFeed({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      authorId: userId,
    });
  }

  // ── Posts ──

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async createPost(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(user.id, dto);
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    return this.communityService.getPost(id);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async deletePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.deletePost(id, user.id);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async updatePost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePostDto,
  ) {
    return this.communityService.updatePost(id, user.id, dto);
  }

  // ── Comments ──

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  async createComment(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCommentDto,
    @Query('parentId') parentId?: string,
  ) {
    return this.communityService.createComment(postId, user.id, dto.content, parentId);
  }

  @Get('posts/:postId/comments')
  async getComments(
    @Param('postId') postId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getComments(postId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  async deleteComment(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.deleteComment(id, user.id);
  }

  // ── Likes ──

  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async toggleLikePost(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.communityService.toggleLikePost(postId, user.id);
  }

  @Post('comments/:commentId/like')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async toggleLikeComment(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    return this.communityService.toggleLikeComment(commentId, user.id);
  }

  // ── Reports ──

  @Post('posts/:id/report')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async reportPost(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReportContentDto,
  ) {
    return this.communityService.reportPost(id, user.id, dto.reason, dto.description);
  }

  @Post('comments/:id/report')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async reportComment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReportContentDto,
  ) {
    return this.communityService.reportComment(id, user.id, dto.reason, dto.description);
  }

  // ── Block ──

  @Post('users/:id/block')
  @UseGuards(JwtAuthGuard)
  async blockUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.blockUser(user.id, id);
  }

  @Delete('users/:id/block')
  @UseGuards(JwtAuthGuard)
  async unblockUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.unblockUser(user.id, id);
  }

  @Get('blocked-users')
  @UseGuards(JwtAuthGuard)
  async getBlockedUsers(@CurrentUser() user: any) {
    return this.communityService.getBlockedUsers(user.id);
  }

  // ── Search & Discovery ──

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any,
  ) {
    if (!q || !q.trim()) return { items: [], total: 0, page: 1, pages: 0 };
    return this.communityService.search({
      q: q.trim(),
      type,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      userId: user?.id,
    });
  }

  @Get('trending')
  async getTrendingTags(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getTrendingTags(
      days ? parseInt(days, 10) : 7,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ── Gig-Community Bridge ──

  @Post('gigs/:gigId/discuss')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async createGigDiscussion(
    @Param('gigId') gigId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.createGigDiscussion(gigId, user.id);
  }

  @Get('gigs/:gigId/discussion')
  async getGigDiscussionId(@Param('gigId') gigId: string) {
    const postId = await this.communityService.getGigDiscussionId(gigId);
    return { postId };
  }

  @Post('gigs/:gigId/cross-post')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async crossPostGig(
    @Param('gigId') gigId: string,
    @CurrentUser() user: any,
  ) {
    return this.communityService.crossPostGig(gigId, user.id);
  }

  // ── Saved Posts ──

  @Post('posts/:id/save')
  @UseGuards(JwtAuthGuard)
  async toggleSavePost(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.toggleSavePost(id, user.id);
  }

  @Get('saved')
  @UseGuards(JwtAuthGuard)
  async getSavedPosts(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.communityService.getSavedPosts(user.id, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  // ── @Mentions Autocomplete ──

  @Get('mentions/search')
  @UseGuards(JwtAuthGuard)
  async searchMentions(@Query('q') query: string) {
    return this.communityService.searchUsers(query);
  }

  // ── View Tracking ──

  @Post('posts/:id/view')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async recordView(@Param('id') id: string, @CurrentUser() user: any) {
    return this.communityService.recordView(id, user.id);
  }

  // ── Reputation ──

  @Get('reputation/:userId')
  async getReputation(@Param('userId') userId: string) {
    return this.communityService.getReputation(userId);
  }

  @Post('reputation/recalculate')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async recalculateReputation(@CurrentUser() user: any) {
    return this.communityService.recalculateReputation(user.id);
  }

  // ── Analytics (Admin) ──

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getCommunityAnalytics() {
    return this.communityService.getCommunityAnalytics();
  }
}
