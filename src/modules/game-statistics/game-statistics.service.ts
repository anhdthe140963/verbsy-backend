import { Injectable } from '@nestjs/common';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { QuestionType } from 'src/constant/question-type.enum';
import { In, Not } from 'typeorm';
import { GameServerService } from '../game-server/game-server.service';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { QuestionTypeConfig } from '../question-type-config/entities/question-type-config.entity';
import { QuestionTypeConfigRepository } from '../question-type-config/repository/question-type-config.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';

@Injectable()
export class GameStatisticsService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly questionTypeConfigRepository: QuestionTypeConfigRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly questionRecordRepository: QuestionRecordRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly userRepository: UserRepository,
    private readonly userClassRepository: UserClassRepository,
  ) {}

  async getSummary(gameId: number) {
    const game = await this.gameRepository.findOne(gameId);
    //Game duration in minutes
    const time =
      (game.endedAt.getTime() - game.createdAt.getTime()) / 1000 / 60;

    const players = await this.playerRepository.count({ where: { gameId } });
    const playersInClass = await this.userClassRepository.count({
      where: { teacherId: null, classId: game.classId },
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

  async getAnswerStatistics(gameId: number, questionId: number) {
    const questionTypeConfig = await this.questionTypeConfigRepository.findOne({
      where: { gameId, questionId },
    });

    switch (questionTypeConfig.questionType) {
      case QuestionType.MultipleChoice:
        const questionRecord = await this.questionRecordRepository.findOne({
          where: { gameId, questionId },
        });

        if (questionRecord.answeredPlayers == 0) {
          return await this.answerRepository.find({
            where: { question: { id: questionId } },
          });
        }

        const statistics = await this.playerDataRepository
          .createQueryBuilder('pd')
          .leftJoin(Player, 'pl', 'pd.player_id = pl.id')
          .leftJoin(Answer, 'a', 'pd.answer_id = a.id')
          .select('a.id', 'id')
          .addSelect('a.content', 'content')
          .addSelect('a.is_correct', 'isCorrect')
          .addSelect('COUNT(pd.answerId)', 'count')
          .where('pl.game_id = :gameId', { gameId: gameId })
          .andWhere('pd.question_id = :questionId', { questionId: questionId })
          .groupBy('pd.answerId')
          .getRawMany();

        const appearedAnswersIds = [];
        for (const s of statistics) {
          appearedAnswersIds.push(s.id);
        }

        const answers = await this.answerRepository.find({
          where: {
            question: { id: questionId },
            id: Not(In(appearedAnswersIds)),
          },
        });

        for (const s of statistics) {
          s.isCorrect = new Boolean(s.isCorrect);
          s.count = parseInt(s.count);
        }

        const answerStats = answers.concat(statistics);
        answerStats.sort((a, b) => a.id - b.id);

        return answerStats;

      case QuestionType.Scramble:
      case QuestionType.Writting:
        const players = await this.playerRepository.find({ where: { gameId } });
        const playersIds = [];
        for (const player of players) {
          playersIds.push(player.id);
        }
        const correctPlayersCount = await this.playerDataRepository.count({
          where: {
            playerId: In(playersIds),
            questionId: questionId,
            isCorrect: true,
          },
        });
        const correctAnswers = await this.answerRepository.find({
          where: { question: { id: questionId }, isCorrect: true },
        });

        const correctAnswersContents: string[] = [];
        for (const correctAnswer of correctAnswers) {
          correctAnswersContents.push(correctAnswer.content);
        }

        return {
          correctAnswersContents,
          correctPlayersCount,
          incorrectPlayersCount: players.length - correctPlayersCount,
        };
    }
  }

  async getLeaderboard(gameId: number): Promise<
    {
      id: number;
      playerId: number;
      username: string;
      fullName: string;
      score: number;
    }[]
  > {
    const records = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoinAndSelect(User, 'u', 'pl.student_id = u.id')
      .select('SUM(pd.score)', 'score')
      .addSelect('u.full_name', 'fullName')
      .addSelect('u.id', 'id')
      .addSelect('pl.id', 'playerId')
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

  async getPlayerDetailedStats(playerId: number) {
    const player = await this.playerRepository.findOne(playerId);

    // const user = await this.userRepository.findOne(player.studentId);

    // const playerData = await this.playerDataRepository.find({
    //   where: { playerId: player.id },
    // });

    const playerData = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoin(QuestionTypeConfig, 'qtc', 'pd.question_id = qtc.question_id')
      .select('qtc.question_id', 'id')
      .addSelect('pd.question', 'question')
      .addSelect('qtc.question_type', 'questionType')
      .addSelect('pd.answer', 'answer')
      .addSelect('pd.is_correct', 'isCorrect')
      .addSelect('pd.answer_time', 'answerTime')
      .addSelect('pd.score', 'score')
      .where('pd.player_id =:playerId', { playerId: player.id })
      .getRawMany();

    const answeredQuesitonsIds = [];
    for (const pd of playerData) {
      answeredQuesitonsIds.push(pd.questionId);
    }

    const leaderboard = await this.getLeaderboard(player.gameId);
    const leaderboardInfo = leaderboard.find((l) => {
      return l.playerId == player.id;
    });
    const generalInfo = {
      ...leaderboardInfo,
      rank: leaderboard.indexOf(leaderboardInfo) + 1 + '/' + leaderboard.length,
    };

    return {
      generalInfo,
      questions: playerData,
    };
  }

  async getQuestionDetailedStats(gameId: number, questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      select: ['id', 'question'],
      loadEagerRelations: false,
    });
    const answersStats = await this.getAnswerStatistics(gameId, questionId);

    return {
      ...question,
      answers: answersStats,
    };
  }
}
