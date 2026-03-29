import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchStudentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  skills?: string; // comma-separated

  @IsOptional()
  @IsString()
  university?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxRate?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsString()
  talentBadge?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'gigsCompleted' | 'hourlyRate' | 'responseTime';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
