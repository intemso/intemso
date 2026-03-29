import { IsOptional, IsString, IsArray } from 'class-validator';

export class SubmitMilestoneDto {
  @IsArray()
  @IsOptional()
  deliverables?: string[];

  @IsString()
  @IsOptional()
  message?: string;
}
