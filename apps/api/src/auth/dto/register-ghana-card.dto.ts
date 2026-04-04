import { IsString, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@intemso/shared';

export class RegisterGhanaCardDto {
  @IsString()
  @Matches(/^GHA-\d{9}-\d$/, {
    message: 'Ghana Card number must be in format GHA-XXXXXXXXX-X',
  })
  ghanaCardNumber!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be either student or employer' })
  role!: UserRole.STUDENT | UserRole.EMPLOYER;

  @IsOptional()
  @IsString()
  university?: string;
}
