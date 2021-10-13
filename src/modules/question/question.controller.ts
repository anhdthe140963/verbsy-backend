import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaginationEnum } from 'src/constant/pagination.enum';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetQuestionFilter } from './dto/get-questions.filter';
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
      message: 'Question created',
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
      message: 'Question updated',
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('list')
  async getQuestionList(
    @Query() filter: GetQuestionFilter,
  ): Promise<{ statusCode; error; message; data }> {
    filter.page = filter.page ? filter.page : PaginationEnum.DefaultPage;
    filter.limit = filter.limit ? filter.limit : PaginationEnum.DefaultLimit;
    const data = await this.questionService.getQuestionList(
      { page: filter.page, limit: filter.limit },
      filter.lectureId,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get question data successfully',
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Delete(':questionId')
  async delete(
    @Param('questionId') questionId: number,
  ): Promise<{ statusCode; error; message }> {
    await this.questionService.delete(questionId);
    return { statusCode: HttpStatus.OK, error: null, message: null };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('answers/:questionId')
  async getAnswerList(
    @Param('questionId') questionId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get answers successfully',
      data: await this.questionService.getAnswerList(questionId),
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
      message: 'Get question detail succesfully',
      data: data,
    };
  }
}
