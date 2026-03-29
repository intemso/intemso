import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
  ArrayMaxSize,
  IsDateString,
} from 'class-validator';

enum BudgetType {
  fixed = 'fixed',
  hourly = 'hourly',
}

enum LocationType {
  remote = 'remote',
  on_site = 'on_site',
  hybrid = 'hybrid',
}

enum ExperienceLevel {
  entry = 'entry',
  intermediate = 'intermediate',
  expert = 'expert',
}

enum ProjectScope {
  small = 'small',
  medium = 'medium',
  large = 'large',
}

enum Urgency {
  asap = 'asap',
  this_week = 'this_week',
  flexible = 'flexible',
}

enum GigStatus {
  draft = 'draft',
  open = 'open',
  closed = 'closed',
  cancelled = 'cancelled',
}

export class UpdateGigDto {
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MinLength(50)
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  requiredSkills?: string[];

  @IsEnum(BudgetType)
  @IsOptional()
  budgetType?: BudgetType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMax?: number;

  @IsEnum(LocationType)
  @IsOptional()
  locationType?: LocationType;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  locationAddress?: string;

  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @IsEnum(ProjectScope)
  @IsOptional()
  projectScope?: ProjectScope;

  @IsEnum(Urgency)
  @IsOptional()
  urgency?: Urgency;

  @IsNumber()
  @Min(1)
  @IsOptional()
  durationHours?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(GigStatus)
  @IsOptional()
  status?: GigStatus;
}
