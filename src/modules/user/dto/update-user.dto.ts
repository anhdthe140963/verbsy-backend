import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../entity/user.entity';

export class updateUserDto extends PartialType(User) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  avatar: string;

  @IsNotEmpty()
  @IsOptional()
  gender: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  dob: string;
}
