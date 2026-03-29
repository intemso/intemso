import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  coverLetter!: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  proposedRate!: number;

  @IsString()
  @IsOptional()
  estimatedDuration?: string;

  @IsArray()
  @IsOptional()
  proposedMilestones?: { title: string; amount: number }[];

  @IsArray()
  @IsOptional()
  screeningAnswers?: string[];
}
