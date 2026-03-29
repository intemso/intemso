import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Query,
  Headers,
  UseGuards,
  RawBodyRequest,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { Request } from 'express';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Initialize a Paystack payment (escrow or connect purchase) */
  @UseGuards(JwtAuthGuard)
  @Post('payments/initialize')
  initialize(
    @CurrentUser('id') userId: string,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initialize(userId, dto);
  }

  /** Paystack webhook — no auth guard, verified by HMAC signature */
  @Post('payments/webhook')
  @HttpCode(200)
  async webhook(
    @Headers('x-paystack-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { status: 'error', message: 'Missing raw body' };
    }
    await this.paymentsService.handleWebhook(signature, rawBody);
    return { status: 'ok' };
  }

  /** Verify a payment reference */
  @UseGuards(JwtAuthGuard)
  @Post('payments/verify')
  verify(@Body('reference') reference: string) {
    return this.paymentsService.verifyTransaction(reference);
  }

  /** List Ghanaian banks (for withdrawal setup UI) */
  @UseGuards(JwtAuthGuard)
  @Get('payments/banks')
  listBanks(@Query('type') type?: string) {
    return this.paymentsService.listBanks(
      type === 'mobile_money' ? 'mobile_money' : undefined,
    );
  }

  /** Resolve/verify a bank account number before saving */
  @UseGuards(JwtAuthGuard)
  @Post('payments/resolve-account')
  resolveAccount(
    @Body('accountNumber') accountNumber: string,
    @Body('bankCode') bankCode: string,
  ) {
    return this.paymentsService.resolveAccountNumber(accountNumber, bankCode);
  }
}
