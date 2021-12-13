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
import { CreateQuestionDto } from './question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  lectureId: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  question: string;

  @IsNotEmpty()
  @IsOptional()
  answers: Answer[];

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  imageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  duration: number;

  @IsNotEmpty()
  @IsEnum(QuestionLevel)
  level: number;
}
