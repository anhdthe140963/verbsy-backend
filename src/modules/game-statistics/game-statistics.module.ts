import { Module } from '@nestjs/common';
import { GameStatisticsService } from './game-statistics.service';
import { GameStatisticsController } from './game-statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GameRepository } from '../game/repositoty/game.repository';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLectureRepository } from '../lesson-lecture/repository/lesson-lecture.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { UserRepository } from '../user/repository/user.repository';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { CurriculumRepository } from '../curriculum/repository/curriculum.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionRepository,
      AnswerRepository,
      GameRepository,
      PlayerRepository,
      UserRepository,
      UserClassRepository,
      ClassesRepository,
      QuestionRecordRepository,
      PlayerDataRepository,
      LectureRepository,
      LessonLectureRepository,
      LessonRepository,
      CurriculumRepository,
      QuestionTypeConfigRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GameStatisticsController],
  providers: [GameStatisticsService],
})
export class GameStatisticsModule {}
