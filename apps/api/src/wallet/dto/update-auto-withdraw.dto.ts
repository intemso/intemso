import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAutoWithdrawDto {
  @IsBoolean()
  enabled!: boolean;

  /** Minimum wallet balance to trigger auto-withdrawal (GH₵) */
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  threshold?: number;
}
