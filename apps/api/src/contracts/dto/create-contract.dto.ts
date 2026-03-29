import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ContractTypeEnum {
  FIXED = 'fixed',
  HOURLY = 'hourly',
}

export class CreateContractDto {
  @IsString()
  @IsOptional()
  gigId?: string;

  @IsString()
  @IsOptional()
  proposalId?: string;

  @IsString()
  studentId!: string;

  @IsEnum(ContractTypeEnum)
  contractType!: ContractTypeEnum;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  agreedRate!: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  weeklyLimit?: number;

  @IsBoolean()
  @IsOptional()
  isDirect?: boolean;
}
