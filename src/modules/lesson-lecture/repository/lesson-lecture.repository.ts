import { EntityRepository, Repository } from 'typeorm';
import { LessonLecture } from '../entities/lesson-lecture.entity';
@EntityRepository(LessonLecture)
export class LessonLectureRepository extends Repository<LessonLecture> {
  async getLessonLectureByLessonId(lessonId): Promise<LessonLecture[]> {
    return await this.find({ lessonId });
  }
}
