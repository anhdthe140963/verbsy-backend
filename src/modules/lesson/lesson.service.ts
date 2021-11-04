import { Injectable } from '@nestjs/common';
import { LessonRepository } from './repository/lesson.repository';

@Injectable()
export class LessonService {
  constructor(private lessonRepository: LessonRepository) {}
}
