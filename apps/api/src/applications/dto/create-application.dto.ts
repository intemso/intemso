import { IsString, IsNumber, IsOptional, IsArray, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsString()
  @IsOptional()
  @MaxLength(280)
  note?: string;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  @Type(() => Number)
  suggestedRate?: number;

  @IsArray()
  @IsOptional()
  screeningAnswers?: string[];
}
