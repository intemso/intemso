import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays!: number;

  /** JSON array of tier objects: [{ name, price, description, deliveryDays, features }] */
  @IsOptional()
  tiers?: any;

  @IsOptional()
  faq?: any;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  deliveryDays?: number;

  @IsOptional()
  tiers?: any;

  @IsOptional()
  faq?: any;

  @IsOptional()
  @IsString()
  status?: string;
}
