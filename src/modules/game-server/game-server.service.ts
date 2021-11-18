import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Game } from '../game/entities/game.entity';
import { GameRepository } from '../game/repositoty/game.repository';
import { PlayerDataRepository } from '../player-data/repository/player-data.repository';
import { Player } from '../player/entities/player.entity';
import { PlayerRepository } from '../player/repository/player.repository';
import { QuestionRecordRepository } from '../question-record/repository/question-record.repository';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { HostGameDto } from './dto/host-game.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class GameServerService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionRecordRepository: QuestionRecordRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameRepository: GameRepository,
    private readonly playerRepository: PlayerRepository,
    private readonly playerDataRepository: PlayerDataRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async getUser(username: string) {
    return await this.userRepository.findOne({
      where: { username: username },
    });
  }

  async getQuestion(questionId: number) {
    const question = await this.questionRepository.findOne(questionId);
    question.answers.forEach((q) => {
      delete q.isCorrect;
    });
    return question;
  }

  async getQuestionsForGame(gameId: number): Promise<Question[]> {
    const game = await this.gameRepository.findOne(gameId);
    const questions = await this.questionRepository.find({
      select: ['id', 'question', 'imageUrl', 'duration'],
      where: { lectureId: game.lectureId },
    });
    return questions;
  }

  async checkAnswer(userId: number, answerId: number) {
    const answer = await this.answerRepository.findOne(answerId);
    return answer.isCorrect;
  }

  async submitAnswer(userId: number, submitAnswerDto: SubmitAnswerDto) {
    const player = await this.playerRepository.findOne({
      where: { studentId: userId, gameId: submitAnswerDto.gameId },
    });

    const answer = await this.answerRepository.findOne(
      submitAnswerDto.answerId,
    );
    const isCorrect = answer.isCorrect;
    let questionRecord = await this.questionRecordRepository.findOne({
      where: {
        gameId: submitAnswerDto.gameId,
        questionId: submitAnswerDto.questionId,
      },
    });
    if (!questionRecord) {
      questionRecord = await this.questionRecordRepository.save({
        gameId: submitAnswerDto.gameId,
        questionId: submitAnswerDto.questionId,
        answeredPlayers: 1,
      });
    } else {
      const questionRecordId = questionRecord.id;
      const answeredPlayers = questionRecord.answeredPlayers + 1;
      questionRecord = await this.questionRecordRepository.save({
        id: questionRecordId,
        gameId: submitAnswerDto.gameId,
        questionId: submitAnswerDto.questionId,
        answeredPlayers: answeredPlayers,
      });
    }

    const question = await this.questionRepository.findOne(
      submitAnswerDto.questionId,
    );

    const score = isCorrect
      ? question.duration - submitAnswerDto.answerTime
      : 0;

    const playerData = await this.playerDataRepository.save({
      answerId: submitAnswerDto.answerId,
      isCorrect: isCorrect,
      playerId: player.id,
      score: score,
      answerTime: submitAnswerDto.answerTime,
    });
  }

  async getAnsweredPlayers(gameId: number, questionId: number) {
    return await this.questionRecordRepository.findOne({
      where: { gameId, questionId },
    });
  }

  async getLeaderboard(gameId: number) {
    const records = await this.playerDataRepository
      .createQueryBuilder('pd')
      .leftJoinAndSelect(Player, 'pl', 'pd.player_id = pl.id')
      .leftJoinAndSelect(User, 'u', 'pl.student_id = u.id')
      .select('SUM(pd.score)', 'score')
      .addSelect('u.full_name', 'fullName')
      .where('pl.game_id = :gameId', { gameId: gameId })
      .groupBy('pd.player_id')
      .orderBy('score', 'DESC')
      .getRawMany();

    return records;
  }

  async endGame(gameId: number) {
    console.log(new Date().toLocaleString());

    return await this.gameRepository.update(
      { id: gameId },
      { isGameLive: false, endedAt: new Date().toLocaleString() },
    );
  }

  async hostNewGame(hostGameDto: HostGameDto): Promise<Game> {
    try {
      return this.gameRepository.hostNewGame(hostGameDto);
    } catch (error) {
      throw error;
    }
  }

  async joinGame(gameId: number, studentId: number): Promise<Player> {
    try {
      if (!(await this.userRepository.isUserExist(studentId))) {
        throw new NotFoundException('Student not exist');
      }
      if (!(await this.gameRepository.isGameExist(gameId))) {
        throw new NotFoundException('Game not exist');
      }
      if (await this.playerRepository.isStudentAlreadyJoin(gameId, studentId)) {
        throw new BadRequestException('Student already join game');
      }
      return await this.playerRepository.playerJoin(gameId, studentId);
    } catch (error) {
      throw error;
    }
  }

  async kickPlayerFromGame(gameId: number, studentId: number) {
    return await this.playerRepository.delete({
      gameId: gameId,
      studentId: studentId,
    });
  }

  async startGame(gameId: number): Promise<Game> {
    try {
      const game = await this.gameRepository.findOne(gameId);
      game.isGameLive = true;
      return await game.save();
    } catch (error) {
      throw error;
    }
  }
}
