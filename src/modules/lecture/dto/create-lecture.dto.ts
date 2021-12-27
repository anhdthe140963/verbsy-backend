import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLectureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  lessonId: number;
}
