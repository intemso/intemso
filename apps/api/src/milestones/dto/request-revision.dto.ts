import { IsOptional, IsString } from 'class-validator';

export class RequestRevisionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
