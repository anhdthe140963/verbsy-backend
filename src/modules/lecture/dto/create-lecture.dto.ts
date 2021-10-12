import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLectureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  publicity: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  ownerId: number;
}
