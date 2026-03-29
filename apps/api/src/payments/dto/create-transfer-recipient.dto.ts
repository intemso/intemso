import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum RecipientType {
  MOBILE_MONEY = 'mobile_money',
  BANK = 'ghipss',
}

export class CreateTransferRecipientDto {
  @IsEnum(RecipientType)
  type!: RecipientType;

  @IsString()
  accountName!: string;

  @IsString()
  accountNumber!: string;

  /** Bank code or mobile money provider code (e.g. 'MTN', 'VOD', 'ATL' for MoMo) */
  @IsString()
  bankCode!: string;

  @IsString()
  @IsOptional()
  bankName?: string;
}
