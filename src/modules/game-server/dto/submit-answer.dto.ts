import { IsInt, IsNotEmpty } from 'class-validator';

export class SubmitAnswerDto {
  gameId: number;
  questionId: number;
  answerId: number;
  answerTime: number;
}
