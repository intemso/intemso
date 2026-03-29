import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ProposalAction {
  VIEW = 'viewed',
  SHORTLIST = 'shortlisted',
  INTERVIEW = 'interview',
  OFFER = 'offer_sent',
  HIRE = 'hired',
  DECLINE = 'declined',
  ARCHIVE = 'archived',
}

export class UpdateProposalStatusDto {
  @IsEnum(ProposalAction)
  status!: ProposalAction;

  @IsString()
  @IsOptional()
  employerNotes?: string;
}
