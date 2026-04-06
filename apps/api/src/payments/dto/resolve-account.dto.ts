import { IsString, IsNotEmpty } from 'class-validator';

export class ResolveAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber!: string;

  @IsString()
  @IsNotEmpty()
  bankCode!: string;
}
