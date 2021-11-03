import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateAccountDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;
}
