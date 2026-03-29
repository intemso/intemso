import { IsString, IsOptional, IsArray, MinLength, IsEnum } from 'class-validator';

export enum DisputeReason {
  QUALITY_ISSUE = 'quality_issue',
  SCOPE_CHANGE = 'scope_change',
  NON_DELIVERY = 'non_delivery',
  UNRESPONSIVE_PARTY = 'unresponsive_party',
  UNREASONABLE_REVISION = 'unreasonable_revision',
  BREACH_OF_CONTRACT = 'breach_of_contract',
  OTHER = 'other',
}

export class CreateDisputeDto {
  @IsString()
  contractId!: string;

  @IsString()
  @IsOptional()
  milestoneId?: string;

  @IsString()
  @IsOptional()
  serviceOrderId?: string;

  @IsEnum(DisputeReason)
  reason!: DisputeReason;

  @IsString()
  @MinLength(50)
  description!: string;

  @IsArray()
  @IsOptional()
  evidence?: string[]; // file URLs

  @IsString()
  @IsOptional()
  desiredResolution?: string; // 'full_refund' | 'full_release' | 'partial_refund' | 'cancel_milestone'
}

export class RespondDisputeDto {
  @IsString()
  @MinLength(50)
  responseNote!: string;

  @IsArray()
  @IsOptional()
  responseEvidence?: string[]; // file URLs
}
