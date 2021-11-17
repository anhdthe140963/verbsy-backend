import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerRepository } from '../player/repository/player.repository';
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
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [GameServerGateway, GameServerService],
})
export class GameServerModule {}
