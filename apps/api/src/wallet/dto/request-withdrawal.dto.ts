import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RequestWithdrawalDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount!: number;

  /** Transfer recipient ID (from addTransferRecipient). If omitted, uses default. */
  @IsString()
  @IsOptional()
  recipientId?: string;
}
