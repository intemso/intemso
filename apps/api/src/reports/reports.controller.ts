import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ── Reports ──

  @Post('reports')
  createReport(@CurrentUser() user: any, @Body() dto: CreateReportDto) {
    return this.reportsService.createReport(user.id, dto);
  }

  // ── Disputes ──

  @Post('contracts/:contractId/disputes')
  createDispute(
    @CurrentUser() user: any,
    @Param('contractId') contractId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.reportsService.createDispute(user.id, contractId, dto);
  }

  @Get('disputes')
  listDisputes(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.listDisputes(user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('disputes/:id')
  getDispute(@CurrentUser() user: any, @Param('id') id: string) {
    return this.reportsService.getDispute(user.id, id);
  }
}
