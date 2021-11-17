import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserRepository } from '../user/repository/user.repository';
import { GameServerGateway } from './game-server.gateway';
import { GameServerService } from './game-server.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionRepository,
      AnswerRepository,
      GameRepository,
      PlayerRepository,
      UserRepository,
      QuestionRecordRepository,
      PlayerDataRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [GameServerGateway, GameServerService],
})
export class GameServerModule {}
