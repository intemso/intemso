import { IsString, IsOptional, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content!: string;

  /** JSON array of attachment URLs */
  @IsArray()
  @IsOptional()
  attachments?: string[];
}
