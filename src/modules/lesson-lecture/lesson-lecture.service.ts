import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { AssignLectureLessonDto } from './dto/assign-lecture-to-lesson.dto';
import { CreateLessonLectureDto } from './dto/create-lesson-lecture.dto';
import { UpdateLessonLectureDto } from './dto/update-lesson-lecture.dto';
import { LessonLecture } from './entities/lesson-lecture.entity';

@Injectable()
export class LessonLectureService {
  constructor(
    private readonly lectureRepo: LectureRepository,
    private readonly lessonRepo: LessonRepository,
    @InjectRepository(LessonLecture)
    private readonly lectureLessonRepo: Repository<LessonLecture>,
  ) {}
  create(createLessonLectureDto: CreateLessonLectureDto) {
    return 'This action adds a new lessonLecture';
  }

  findAll() {
    return `This action returns all lessonLecture`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lessonLecture`;
  }

  update(id: number, updateLessonLectureDto: UpdateLessonLectureDto) {
    return `This action updates a #${id} lessonLecture`;
  }

  remove(id: number) {
    return `This action removes a #${id} lessonLecture`;
  }

  async assignLectureToLesson(assignLectureLessonDto: AssignLectureLessonDto) {
    try {
      const { lectureIds, lessonId } = assignLectureLessonDto;
      //check lecture
      for (const lectureId of lectureIds) {
        const lecture = await this.lectureRepo.findOne(lectureId);
        if (!lecture) {
          throw new NotFoundException(`Lecture with id ${lectureId} not exist`);
        }
      }
      //check lesson exist
      const lesson = await this.lessonRepo.findOne(lessonId);
      if (!lesson) {
        throw new NotFoundException(`Lesson with id ${lessonId} not exist`);
      }
      await this.lectureLessonRepo
        .createQueryBuilder()
        .delete()
        .where('lesson_id = :id', { id: lessonId })
        .execute();
      for (const lecId of lectureIds) {
        await this.lectureLessonRepo.insert({
          lectureId: lecId,
          lessonId: lessonId,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
