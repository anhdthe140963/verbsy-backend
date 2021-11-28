import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
}
