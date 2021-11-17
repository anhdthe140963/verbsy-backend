import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameRepository } from './repositoty/game.repository';
import { PassportModule } from '@nestjs/passport';
import { ClassesRepository } from '../classes/repository/classes.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([GameRepository, ClassesRepository]),
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
