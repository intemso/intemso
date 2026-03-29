import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MaxLength(50)
  reportedEntity!: string; // 'user', 'gig', 'review'

  @IsString()
  reportedId!: string;

  @IsString()
  @MaxLength(1000)
  reason!: string;
}
