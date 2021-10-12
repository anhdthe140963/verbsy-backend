import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
}
