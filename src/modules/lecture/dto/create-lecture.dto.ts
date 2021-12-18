import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLectureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  lessonId: number;
}
