import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /** Student applies for a gig (Easy Apply) */
  @Post('gigs/:gigId/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  create(
    @CurrentUser('id') userId: string,
    @Param('gigId') gigId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.create(userId, gigId, dto);
  }

  /** Employer views applications for their gig */
  @Get('gigs/:gigId/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  findByGig(
    @CurrentUser('id') userId: string,
    @Param('gigId') gigId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.findByGig(userId, gigId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  /** Student views their own applications */
  @Get('applications/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  findMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.applicationsService.findMyApplications(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  /** Get single application detail */
  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    return this.applicationsService.findOne(userId, role, id);
  }

  /** Employer updates application status (review, hire, decline) */
  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('employer')
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(userId, id, dto);
  }

  /** Student withdraws their application */
  @Patch('applications/:id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  withdraw(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.applicationsService.withdraw(userId, id);
  }
}
