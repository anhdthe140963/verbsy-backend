import { QuestionType } from 'src/constant/question-type.enum';

export class HostGameDto {
  lectureId: number;
  classId: number;
  questionsConfig: {
    questions: number;
    timeFactorWeight: number;
    questionTypes: QuestionType[];
  };
  difficultyConfig: {
    easy: number;
    medium: number;
    hard: number;
  };
}
