import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateConversationDto {
  /** User ID of the other participant */
  @IsString()
  participantId!: string;

  /** Optionally link to a gig */
  @IsString()
  @IsOptional()
  gigId?: string;

  /** Optional initial message */
  @IsString()
  @IsOptional()
  message?: string;
}
