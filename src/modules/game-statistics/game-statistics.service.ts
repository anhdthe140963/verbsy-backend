import { Injectable } from '@nestjs/common';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { In, Not } from 'typeorm';
import { GameServerService } from '../game-server/game-server.service';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { Question } from '../question/entity/question.entity';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';

@Injectable()
export class GameStatisticsService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly questionTypeConfigRepository: QuestionTypeConfigRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly userClassRepository: UserClassRepository,
  ) {}

  async getSummary(gameId: number) {
    const game = await this.gameRepository.findOne(gameId);
    //Game duration in minutes
    const time =
      (game.endedAt.getTime() - game.createdAt.getTime()) / 1000 / 60;

    const players = await this.playerRepository.count({ where: { gameId } });
    const playersInClass = await this.userClassRepository.count({
      where: { teacherId: Not(null), classId: game.classId },
    });

    const questions = await this.questionTypeConfigRepository.find({
      where: { gameId },
    });

    const questionIds = [];
    for (const q of questions) {
      questionIds.push(q.questionId);
    }

    const easy = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Easy },
    });
    const medium = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Medium },
    });
    const hard = await this.questionRepository.count({
      where: { id: In(questionIds), level: QuestionLevel.Hard },
    });

    return {
      players: players + `/` + playersInClass,
      questions: {
        easy,
        medium,
        hard,
        total: easy + medium + hard,
      },
      time: time.toFixed(2),
    };
  }

  async getLeaderboard(gameId: number) {
    const records = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoinAndSelect(User, 'u', 'pl.student_id = u.id')
      .select('SUM(pd.score)', 'score')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.id', 'id')
      .addSelect('u.username', 'username')
      .where('pl.game_id = :gameId', { gameId: gameId })
      .groupBy('pd.player_id')
      .orderBy('score', 'DESC')
      .getRawMany();

    return records;
  }

  async getGameCompletionRate(gameId: number) {
    const players = await this.playerRepository.find({ where: { gameId } });

    const playersIds = [];
    for (const p of players) {
      playersIds.push(p.id);
    }

    const playersData = await this.playerDataRepository.find({
      where: { playerId: In(playersIds) },
    });

    let correct = 0;
    let incorrect = 0;
    let notAnswered = 0;
    for (const p of playersData) {
      switch (p.isCorrect) {
        case null:
          notAnswered++;
          break;
        case true:
          correct++;
          break;
        case false:
          incorrect++;
          break;
      }
    }

    return {
      correct,
      incorrect,
      notAnswered,
    };
  }
}
