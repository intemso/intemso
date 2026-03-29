import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, RespondDisputeDto } from './dto/create-dispute.dto';

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputesService.create(userId, dto);
  }

  @Patch(':id/respond')
  respond(
    @CurrentUser('id') userId: string,
    @Param('id') disputeId: string,
    @Body() dto: RespondDisputeDto,
  ) {
    return this.disputesService.respond(userId, disputeId, dto);
  }

  @Get('me')
  findMine(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.disputesService.findMyDisputes(userId, {
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') disputeId: string,
  ) {
    return this.disputesService.findOne(userId, disputeId, role);
  }
}
