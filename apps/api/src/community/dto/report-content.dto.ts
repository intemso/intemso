import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class ReportContentDto {
  @IsString()
  @IsIn(['spam', 'harassment', 'inappropriate', 'misinformation', 'other'])
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
