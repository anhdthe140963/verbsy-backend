import { PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { Answer } from '../entity/answer.entity';
import { Question } from '../entity/question.entity';

export class CreateQuestionDto extends PartialType(Question) {
  @IsNotEmpty()
  @IsNumber()
  lectureId: number;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  answers: Answer[];

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsEnum(QuestionLevel)
  level: number;
}
