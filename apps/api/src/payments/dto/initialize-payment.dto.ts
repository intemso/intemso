import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentPurpose {
  MILESTONE_ESCROW = 'milestone_escrow',
  CONNECTS_PURCHASE = 'connects_purchase',
  SERVICE_ORDER_ESCROW = 'service_order_escrow',
  BONUS_PAYMENT = 'bonus_payment',
}

export class InitializePaymentDto {
  @IsEnum(PaymentPurpose)
  purpose!: PaymentPurpose;

  /** Milestone ID when funding escrow */
  @IsString()
  @IsOptional()
  milestoneId?: string;

  /** Connect pack size (10, 20, 40) when buying connects */
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  packSize?: number;

  /** Service order ID when paying for a service */
  @IsString()
  @IsOptional()
  serviceOrderId?: string;

  /** Contract ID for bonus payment */
  @IsString()
  @IsOptional()
  contractId?: string;

  /** Amount in GH₵ for bonus payment */
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  /** Optional callback URL override */
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
