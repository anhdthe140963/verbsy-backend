import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignLectureLessonDto {
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  lectureIds: number[];

  @IsNumber()
  @IsNotEmpty()
  lessonId: number;
}
