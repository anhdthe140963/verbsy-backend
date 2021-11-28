import { QuestionType } from 'src/constant/question-type.enum';

export class NextQuestion {
  nextQuestion: any;
  questionType: QuestionType;
  remainQuestions: number;
  totalQuestions: number;
}
