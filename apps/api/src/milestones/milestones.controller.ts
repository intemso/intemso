import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';

@Controller()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  /** Add a milestone to a contract */
  @Post('contracts/:contractId/milestones')
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,
    @Param('contractId') contractId: string,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.milestonesService.create(userId, contractId, dto);
  }

  /** Student submits deliverables for a milestone */
  @Patch('milestones/:id/submit')
  @UseGuards(JwtAuthGuard)
  submit(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitMilestoneDto,
  ) {
    return this.milestonesService.submit(userId, id, dto);
  }

  /** Employer approves a submitted milestone */
  @Patch('milestones/:id/approve')
  @UseGuards(JwtAuthGuard)
  approve(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.milestonesService.approve(userId, id);
  }

  /** Employer requests revision on a submitted milestone */
  @Patch('milestones/:id/request-revision')
  @UseGuards(JwtAuthGuard)
  requestRevision(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.milestonesService.requestRevision(userId, id, dto);
  }
}
