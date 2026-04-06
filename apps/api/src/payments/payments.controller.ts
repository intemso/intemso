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
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ResolveAccountDto } from './dto/resolve-account.dto';
import { Request } from 'express';
import * as net from 'net';

// Paystack webhook source IPs (https://paystack.com/docs/payments/webhooks/#ip-whitelisting)
const PAYSTACK_WEBHOOK_CIDRS = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220',
];

function isPaystackIp(ip: string): boolean {
  const cleaned = ip.replace(/^::ffff:/, '');
  return PAYSTACK_WEBHOOK_CIDRS.includes(cleaned);
}

@Controller()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  /** Initialize a Paystack payment (escrow or connect purchase) */
  @UseGuards(JwtAuthGuard)
  @Post('payments/initialize')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  initialize(
    @CurrentUser('id') userId: string,
    @Body() dto: InitializePaymentDto,
  ) {
    return this.paymentsService.initialize(userId, dto);
  }

  /** Paystack webhook — no auth guard, verified by HMAC signature + IP whitelist */
  @Post('payments/webhook')
  @HttpCode(200)
  async webhook(
    @Headers('x-paystack-signature') signature: string,
    @Headers('x-forwarded-for') forwardedFor: string | undefined,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // IP whitelist check in production
    if (this.config.get('NODE_ENV') === 'production') {
      // Take the LAST IP (the one added by our trusted Nginx proxy)
      const forwardedIps = forwardedFor?.split(',').map(s => s.trim()) || [];
      const clientIp = forwardedIps[forwardedIps.length - 1] || req.ip || '';
      if (!isPaystackIp(clientIp)) {
        this.logger.warn(`Webhook rejected — untrusted IP: ${clientIp}`);
        throw new ForbiddenException('Untrusted source');
      }
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      return { status: 'error', message: 'Missing raw body' };
    }
    await this.paymentsService.handleWebhook(signature, rawBody);
    return { status: 'ok' };
  }

  /** Verify a payment reference (only your own payments) */
  @UseGuards(JwtAuthGuard)
  @Post('payments/verify')
  async verify(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    const result = await this.paymentsService.verifyTransaction(dto.reference);
    // Ensure the payment belongs to the requesting user
    if (result?.data?.metadata?.userId && result.data.metadata.userId !== userId) {
      throw new ForbiddenException('You can only verify your own payments');
    }
    return result;
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
    @Body() dto: ResolveAccountDto,
  ) {
    return this.paymentsService.resolveAccountNumber(dto.accountNumber, dto.bankCode);
  }
}
