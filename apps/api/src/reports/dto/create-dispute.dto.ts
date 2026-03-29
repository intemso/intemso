import { IsString, MaxLength } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @MaxLength(2000)
  reason!: string;
}
