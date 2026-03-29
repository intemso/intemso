import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import {
  UpdateStudentProfileDto,
  UpdateEmployerProfileDto,
  UpdateMediaDto,
} from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Public profile (no auth required) ──

  @Get(':id/profile')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // ── Authenticated endpoints ──

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me/media')
  @UseGuards(JwtAuthGuard)
  updateMedia(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateMediaDto,
  ) {
    return this.usersService.updateMedia(userId, body);
  }

  @Patch('me/student-profile')
  @UseGuards(JwtAuthGuard)
  updateStudentProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateStudentProfileDto,
  ) {
    return this.usersService.updateStudentProfile(userId, body);
  }

  @Patch('me/employer-profile')
  @UseGuards(JwtAuthGuard)
  updateEmployerProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateEmployerProfileDto,
  ) {
    return this.usersService.updateEmployerProfile(userId, body);
  }

  // ── Suggestions ──

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  getSuggestions(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getSuggestions(userId, limit ? parseInt(limit, 10) : 6);
  }

  // ── Follow System ──

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  followUser(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
  ) {
    return this.usersService.followUser(userId, targetId);
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  unfollowUser(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
  ) {
    return this.usersService.unfollowUser(userId, targetId);
  }

  @Get(':id/followers')
  getFollowers(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getFollowers(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id/following')
  getFollowing(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.getFollowing(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(
    @CurrentUser('id') userId: string,
    @Param('id') targetId: string,
  ) {
    const [isFollowing, counts] = await Promise.all([
      this.usersService.isFollowing(userId, targetId),
      this.usersService.getFollowCounts(targetId),
    ]);
    return { isFollowing, ...counts };
  }
}
