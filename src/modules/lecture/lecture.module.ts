import { Module } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureRepository } from './repository/lecture.repository';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from '../user/repository/user.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      LectureRepository,
      UserRepository,
      LessonRepository,
    ]),
  ],
  controllers: [LectureController],
  providers: [LectureService],
})
export class LectureModule {}
