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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /** Employer creates a direct contract */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER')
  create(@CurrentUser('id') userId: string, @Body() dto: CreateContractDto) {
    return this.contractsService.create(userId, dto);
  }

  /** User's contracts (student or employer) */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.contractsService.findMyContracts(userId, role, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  /** Single contract detail */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') id: string,
  ) {
    return this.contractsService.findOne(userId, role, id);
  }

  /** Update contract status (pause, resume, complete, cancel) */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContractStatusDto,
  ) {
    return this.contractsService.updateStatus(userId, id, dto);
  }

  /** List weekly invoices for an hourly contract */
  @Get(':id/invoices')
  @UseGuards(JwtAuthGuard)
  getInvoices(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') contractId: string,
  ) {
    return this.contractsService.getInvoices(userId, role, contractId);
  }
}
