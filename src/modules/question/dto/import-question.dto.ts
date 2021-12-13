import { PartialType } from '@nestjs/swagger';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { Question } from '../entity/question.entity';

export class ImportQuestionDto extends PartialType(Question) {
  question: string;

  imageUrl: string;

  duration: number;

  level: QuestionLevel;
}
