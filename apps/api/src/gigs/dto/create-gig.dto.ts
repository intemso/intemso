import {
  IsString,
  IsNotEmpty,
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

export class CreateGigDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  description!: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  requiredSkills?: string[];

  @IsEnum(BudgetType)
  budgetType!: BudgetType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budgetMax?: number;

  @IsEnum(LocationType)
  locationType!: LocationType;

  @IsString()
  @IsOptional()
  @MaxLength(255)
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
}
