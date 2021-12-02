import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from './repositoty/game.repository';
import { PassportModule } from '@nestjs/passport';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { PlayerRepository } from '../player/repository/player.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      GameRepository,
      ClassesRepository,
      UserClassRepository,
      PlayerRepository,
      PlayerDataRepository,
      LectureRepository,
      UserRepository,
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
