import { IsEmail, IsEnum, IsString, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '@intemso/shared';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be either student or employer' })
  role!: UserRole.STUDENT | UserRole.EMPLOYER;
}
