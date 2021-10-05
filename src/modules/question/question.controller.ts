import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.questionService.createQuestion(createQuestionDto);
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: null,
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':questionId')
  async getQuestionDetail(
    @Param('questionId') questionId: number,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.questionService.getQuestionDetail(questionId);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: null,
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':questionId')
  async updateQuestion(
    @Param('questionId') questionId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<{ statusCode; error; message }> {
    await this.questionService.updateQuestion(questionId, updateQuestionDto);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: null,
    };
  }
}
