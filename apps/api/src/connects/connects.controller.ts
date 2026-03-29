import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConnectsService } from './connects.service';

@Controller('connects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConnectsController {
  constructor(private readonly connectsService: ConnectsService) {}

  /** Get connect balance */
  @Get('balance')
  @Roles('STUDENT')
  getBalance(@CurrentUser('id') userId: string) {
    return this.connectsService.getBalance(userId);
  }

  /** Connect transaction history */
  @Get('transactions')
  @Roles('STUDENT')
  transactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.connectsService.getTransactions(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
