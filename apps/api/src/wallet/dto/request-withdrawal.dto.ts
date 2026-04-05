import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestWithdrawalDto {
  @IsNumber()
  @Min(1)
  @Max(50000)
  @Type(() => Number)
  amount!: number;

  /** Transfer recipient ID (from addTransferRecipient). If omitted, uses default. */
  @IsString()
  @IsOptional()
  recipientId?: string;
}
