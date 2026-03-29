import { IsOptional, IsString, IsEnum, IsInt, IsBoolean, Min, Max, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ListUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'active' | 'suspended'

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  suspend?: boolean;

  @IsOptional()
  @IsBoolean()
  activate?: boolean;
}

export class ResolveDisputeDto {
  @IsString()
  resolution!: string; // 'resolved_student' | 'resolved_employer' | 'resolved_split'

  @IsOptional()
  @IsString()
  adminNotes?: string;

  /** Required when resolution is 'resolved_split': percentage to student (1–99) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  splitPercentage?: number;
}

export class ReviewReportDto {
  @IsString()
  status!: string; // 'reviewed' | 'action_taken' | 'dismissed'

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  isActive?: boolean;
}
