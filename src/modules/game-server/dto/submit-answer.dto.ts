import { QuestionType } from 'src/constant/question-type.enum';

export class SubmitAnswerDto {
  gameId: number;
  questionId: number;
  questionType: QuestionType;
  answerId: number;
  answer: string;
  answerTime: number;
}
