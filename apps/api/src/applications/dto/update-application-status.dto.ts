import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ApplicationAction {
  REVIEW = 'reviewed',
  HIRE = 'hired',
  DECLINE = 'declined',
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationAction)
  status!: ApplicationAction;

  @IsString()
  @IsOptional()
  employerNotes?: string;
}
