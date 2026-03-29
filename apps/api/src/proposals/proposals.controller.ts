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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalStatusDto } from './dto/update-proposal-status.dto';

@Controller()
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  /** Student submits a proposal for a gig */
  @Post('gigs/:gigId/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  create(
    @CurrentUser('id') userId: string,
    @Param('gigId') gigId: string,
    @Body() dto: CreateProposalDto,
  ) {
    return this.proposalsService.create(userId, gigId, dto);
  }

  /** Employer views proposals for their gig */
  @Get('gigs/:gigId/proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  findByGig(
    @CurrentUser('id') userId: string,
    @Param('gigId') gigId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.proposalsService.findByGig(userId, gigId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  /** Student views their own proposals */
  @Get('proposals/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  findMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.proposalsService.findMyProposals(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  /** Get single proposal detail */
  @Get('proposals/:id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.findOne(userId, role, id);
  }

  /** Employer updates proposal status (shortlist, decline, hire, etc.) */
  @Patch('proposals/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProposalStatusDto,
  ) {
    return this.proposalsService.updateStatus(userId, id, dto);
  }

  /** Student withdraws their proposal */
  @Patch('proposals/:id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  withdraw(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.proposalsService.withdraw(userId, id);
  }
}
