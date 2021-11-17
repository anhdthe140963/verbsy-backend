import { Injectable } from '@nestjs/common';
import { Game } from '../game/entities/game.entity';
import { GameRepository } from '../game/repositoty/game.repository';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { HostGameDto } from './dto/host-game.dto';

@Injectable()
export class GameServerService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gameRepo: GameRepository,
  ) {}

  async getQuestion(questionId: number) {
    const question = await this.questionRepository.findOne(questionId);
    question.answers.forEach((q) => {
      delete q.isCorrect;
    });
    return question;
  }

  async checkAnswer(answerId: number) {
    const answer = await this.answerRepository.findOne(answerId);
    return answer.isCorrect;
  }

  async hostNewGame(hostGameDto: HostGameDto): Promise<Game> {
    try {
      return this.gameRepo.hostNewGame(hostGameDto);
    } catch (error) {
      throw error;
    }
  }

  async startGame(gameId: number): Promise<Game> {
    try {
      const game = await this.gameRepo.findOne(gameId);
      game.isGameLive = true;
      return await game.save();
    } catch (error) {
      throw error;
    }
  }
}
