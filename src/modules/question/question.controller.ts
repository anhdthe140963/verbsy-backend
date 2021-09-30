import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateResult } from 'typeorm';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entity/question.entity';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return await this.questionService.createQuestion(createQuestionDto);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':questionId')
  async getQuestionDetail(
    @Param('questionId') questionId: number,
  ): Promise<Question> {
    return await this.questionService.getQuestionDetail(questionId);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
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
