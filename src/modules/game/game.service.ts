import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from 'src/constant/role.enum';
import { Classes } from '../classes/entity/classes.entity';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Curriculum } from '../curriculum/entities/curriculum.entity';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { Lecture } from '../lecture/entity/lecture.entity';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { Game } from './entities/game.entity';
import { GameRepository } from './repositoty/game.repository';

@Injectable()
export class GameService {
  constructor(
    private gameRepository: GameRepository,
    private classRepository: ClassesRepository,
    private userClassRepository: UserClassRepository,
  ) {}
  async findActiveGames(user: User): Promise<Game[]> {
    try {
      const classes = await this.userClassRepository.find({
        where: { studentId: user.id },
      });
      const classesIds = [];
      for (const c of classes) {
        classesIds.push(c.classId);
      }

      const games = await this.gameRepository
        .createQueryBuilder('g')
        .leftJoinAndSelect(Classes, 'cl', 'g.class_id = cl.id')
        .leftJoinAndSelect(Lecture, 'l', 'g.lecture_id = l.id')
        .select('g.id', 'id')
        .addSelect('l.name', 'lectureName')
        .addSelect('cl.name', 'className')
        .addSelect('g.created_at', 'createdAt')
        .where('g.classId IN(:classesIds)', { classesIds: classesIds })
        .andWhere('g.is_game_live =:isLive', { isLive: true })
        .orderBy('g.created_at')
        .getRawMany();
      return games;
    } catch (error) {
      throw error;
    }
  }

  async getGamesOfCurriculum(curriculumId: number) {
    const games = await this.gameRepository
      .createQueryBuilder('g')
      .leftJoin(Lecture, 'lec', 'g.lecture_id = lec.id')
      .leftJoin(Lesson, 'les', 'lec.lesson_id = les.id')
      .leftJoin(Curriculum, 'c', 'les.curriculum_id = c.id')
      .where('c.id = :curriculumId', { curriculumId })
      .andWhere('g.is_game_live = :isGameLive', { isGameLive: true })
      .getMany();

    return games;
  }
}
