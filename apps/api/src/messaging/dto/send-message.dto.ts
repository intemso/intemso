import { IsString, IsOptional, IsArray, MaxLength, ArrayMaxSize } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MaxLength(10000)
  content!: string;

  /** JSON array of attachment URLs */
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(2000, { each: true })
  attachments?: string[];
}
