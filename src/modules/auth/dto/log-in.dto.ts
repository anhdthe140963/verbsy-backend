import { IsNotEmpty, IsString } from 'class-validator';

export class LogInDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
