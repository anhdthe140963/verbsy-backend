import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Grade } from '../grade/entities/grade.entity';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLecture } from '../lesson-lecture/entities/lesson-lecture.entity';
import { LessonMaterialRepository } from '../lesson-material/repository/lesson-material.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { UserRepository } from '../user/repository/user.repository';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { Curriculum } from './entities/curriculum.entity';
import { Lesson } from './entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      ClassesRepository,
      UserRepository,
      Curriculum,
      Lesson,
      LessonMaterialRepository,
      LessonLecture,
      LectureRepository,
      UserClassRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
})
export class CurriculumModule {}
