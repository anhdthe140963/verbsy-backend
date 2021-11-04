import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty()
  @IsInt()
  curriculumId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
