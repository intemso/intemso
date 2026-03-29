import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SavedItemsService } from './saved-items.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class SavedItemsController {
  constructor(private savedItemsService: SavedItemsService) {}

  // ── Saved Gigs (Students) ──

  @Post('saved-gigs/:gigId')
  async saveGig(@Param('gigId') gigId: string, @CurrentUser() user: any) {
    if (user.role !== 'student') throw new ForbiddenException('Only students can save gigs');
    return this.savedItemsService.saveGig(user.studentProfile.id, gigId);
  }

  @Delete('saved-gigs/:gigId')
  async unsaveGig(@Param('gigId') gigId: string, @CurrentUser() user: any) {
    if (user.role !== 'student') throw new ForbiddenException('Only students can save gigs');
    return this.savedItemsService.unsaveGig(user.studentProfile.id, gigId);
  }

  @Get('saved-gigs')
  async getSavedGigs(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (user.role !== 'student') throw new ForbiddenException('Only students can save gigs');
    return this.savedItemsService.getSavedGigs(
      user.studentProfile.id,
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }

  // ── Saved Talent (Employers) ──

  @Post('saved-talent/:studentId')
  async saveTalent(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    if (user.role !== 'employer') throw new ForbiddenException('Only employers can save talent');
    return this.savedItemsService.saveTalent(user.employerProfile.id, studentId);
  }

  @Delete('saved-talent/:studentId')
  async unsaveTalent(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    if (user.role !== 'employer') throw new ForbiddenException('Only employers can save talent');
    return this.savedItemsService.unsaveTalent(user.employerProfile.id, studentId);
  }

  @Get('saved-talent')
  async getSavedTalent(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (user.role !== 'employer') throw new ForbiddenException('Only employers can save talent');
    return this.savedItemsService.getSavedTalent(
      user.employerProfile.id,
      parseInt(page || '1'),
      parseInt(limit || '20'),
    );
  }
}
