import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistRepository } from '../blacklist/repository/blacklist.repository';
import { GameStateRepository } from '../game-state/repository/game-state.repository';
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
import { GameServerGateway } from './game-server.gateway';
import { GameServerService } from './game-server.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionRepository,
      AnswerRepository,
      GameRepository,
      GameStateRepository,
      PlayerRepository,
      UserRepository,
      UserClassRepository,
      QuestionRecordRepository,
      PlayerDataRepository,
      BlacklistRepository,
      LectureRepository,
      LessonLectureRepository,
      LessonRepository,
      QuestionTypeConfigRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [GameServerGateway, GameServerService],
})
export class GameServerModule {}
