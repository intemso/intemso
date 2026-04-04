import { IsString, Matches } from 'class-validator';

export class LoginGhanaCardDto {
  @IsString()
  @Matches(/^GHA-\d{9}-\d$/, {
    message: 'Ghana Card number must be in format GHA-XXXXXXXXX-X',
  })
  ghanaCardNumber!: string;

  @IsString()
  password!: string;
}
