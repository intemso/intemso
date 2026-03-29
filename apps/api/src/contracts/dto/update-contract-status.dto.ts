import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ContractAction {
  PAUSE = 'paused',
  RESUME = 'active',
  COMPLETE = 'completed',
  CANCEL = 'cancelled',
}

export class UpdateContractStatusDto {
  @IsEnum(ContractAction)
  status!: ContractAction;

  @IsString()
  @IsOptional()
  endReason?: string;
}
