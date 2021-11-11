import { Injectable } from '@nestjs/common';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';

@Injectable()
export class GameServerService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: AnswerRepository,
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
}
