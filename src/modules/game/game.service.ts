import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Game } from './entities/game.entity';
import { GameRepository } from './repositoty/game.repository';

@Injectable()
export class GameService {
  constructor(
    private gameRepo: GameRepository,
    private classRepo: ClassesRepository,
  ) {}
  async findActiveGames(classId: number): Promise<Game[]> {
    try {
      if (!(await this.classRepo.isClassExist(classId))) {
        throw new NotFoundException('Class Not Exist');
      }
      return await this.gameRepo.findActiveGames(classId);
    } catch (error) {
      throw error;
    }
  }
}
