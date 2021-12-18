import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonLectureDto } from './create-lesson-lecture.dto';

export class UpdateLessonLectureDto extends PartialType(
  CreateLessonLectureDto,
) {}
