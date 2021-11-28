import { Module } from '@nestjs/common';
import { LessonLectureService } from './lesson-lecture.service';
import { LessonLectureController } from './lesson-lecture.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { UserRepository } from '../user/repository/user.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { LessonLecture } from './entities/lesson-lecture.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      LectureRepository,
      UserRepository,
      LessonRepository,
      LessonLecture,
    ]),
  ],
  controllers: [LessonLectureController],
  providers: [LessonLectureService],
})
export class LessonLectureModule {}
