import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from 'src/constant/role.enum';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { Game } from './entities/game.entity';
import { GameRepository } from './repositoty/game.repository';

@Injectable()
export class GameService {
  constructor(
    private gameRepo: GameRepository,
    private classRepo: ClassesRepository,
    private userClassRepo: UserClassRepository,
  ) {}
  async findActiveGames(user: User): Promise<Game[]> {
    try {
      if (user.role != Role.Student) {
        throw new BadRequestException('User is not a student');
      }
      const classId = await this.userClassRepo.getClassIdByStudentId(user.id);
      return await this.gameRepo.findActiveGames(classId);
    } catch (error) {
      throw error;
    }
  }
}
