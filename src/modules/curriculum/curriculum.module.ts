import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { GradeRepository } from '../grade/repository/grade.repository';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLectureRepository } from '../lesson-lecture/repository/lesson-lecture.repository';
import { LessonMaterialRepository } from '../lesson-material/repository/lesson-material.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { UserRepository } from '../user/repository/user.repository';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { CurriculumRepository } from './repository/curriculum.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurriculumRepository,
      ClassesRepository,
      UserRepository,
      LessonRepository,
      LessonMaterialRepository,
      LessonLectureRepository,
      LectureRepository,
      UserClassRepository,
      QuestionRepository,
      GradeRepository,
      SchoolYearRepository,
      AnswerRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
})
export class CurriculumModule {}
