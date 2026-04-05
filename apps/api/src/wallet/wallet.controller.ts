import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { WalletService } from './wallet.service';
import { PaymentsService } from '../payments/payments.service';
import { RequestWithdrawalDto } from './dto/request-withdrawal.dto';
import { CreateTransferRecipientDto } from '../payments/dto/create-transfer-recipient.dto';
import { UpdateAutoWithdrawDto } from './dto/update-auto-withdraw.dto';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /** Get wallet balance + transfer recipients */
  @Get()
  getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  // ── Transfer Recipients ──

  /** Add a payout destination (bank account or mobile money) */
  @Post('recipients')
  addRecipient(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTransferRecipientDto,
  ) {
    return this.walletService.addTransferRecipient(userId, dto);
  }

  /** List payout destinations */
  @Get('recipients')
  getRecipients(@CurrentUser('id') userId: string) {
    return this.walletService.getTransferRecipients(userId);
  }

  /** Set a payout destination as default */
  @Patch('recipients/:id/default')
  setDefaultRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ) {
    return this.walletService.setDefaultRecipient(userId, recipientId);
  }

  /** Remove a payout destination */
  @Delete('recipients/:id')
  removeRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ) {
    return this.walletService.removeTransferRecipient(userId, recipientId);
  }

  // ── Withdrawals ──

  /** Request a withdrawal via Paystack transfer */
  @Post('withdraw')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  async withdraw(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestWithdrawalDto,
  ) {
    // Rate limit check before processing
    await this.paymentsService.validateWithdrawalLimits(userId, dto.amount);
    const result = await this.walletService.requestWithdrawal(userId, dto);
    // Record daily withdrawal after success
    await this.paymentsService.recordDailyWithdrawal(userId, dto.amount);
    return result;
  }

  // ── Auto-Withdraw Settings ──

  /** Update auto-withdraw preferences */
  @Patch('auto-withdraw')
  updateAutoWithdraw(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAutoWithdrawDto,
  ) {
    return this.paymentsService.updateAutoWithdrawSettings(userId, {
      enabled: dto.enabled,
      threshold: dto.threshold,
    });
  }

  /** Wallet transaction history */
  @Get('transactions')
  transactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactions(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  /** Withdrawal history */
  @Get('withdrawals')
  withdrawals(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getWithdrawals(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
