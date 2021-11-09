import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLectureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  ownerId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  lessonId: number;
}
