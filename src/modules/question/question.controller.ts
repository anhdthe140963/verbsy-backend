import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entity/question.entity';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return await this.questionService.createQuestion(createQuestionDto);
  }

  @Get(':questionId')
  async getQuestionDetail(
    @Param('questionId') questionId: number,
  ): Promise<Question> {
    return await this.questionService.getQuestionDetail(questionId);
  }

  @Put(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<UpdateResult> {
    return await this.questionService.updateQuestion(
      questionId,
      updateQuestionDto,
    );
  }
}
