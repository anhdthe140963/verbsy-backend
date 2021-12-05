import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationEnum } from 'src/constant/pagination.enum';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import fileExcelFilter from 'src/filter/file.excel.filter';
import { RolesGuard } from 'src/guards/roles.guard';
import { GetQuestionFilter } from './dto/get-questions.filter';
import { CreateQuestionDto } from './dto/question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';
import questionExcelFormat from 'excel-format/questions-format.json';
import { ImportQuestionDto } from './dto/import-question.dto';
import { QuestionLevel } from 'src/constant/question-level.enum';
import { Question } from './entity/question.entity';
import { Answer } from './entity/answer.entity';

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
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Delete question successfully',
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator, Role.Student)
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
  @Roles(Role.Teacher, Role.Administrator, Role.Student)
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
  @UseGuards(AuthGuard(), RolesGuard)
  @Post('import/:lectureId')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExcelFilter,
    }),
  )
  async importQuestions(
    @Param('lectureId') lectureId: number,
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excelToJson = require('convert-excel-to-json');
    const excel = excelToJson(
      Object.assign(
        {
          source: file.buffer,
        },
        questionExcelFormat,
      ),
    );

    //transform data
    try {
      const rawData: {
        question: string;
        imageUrl: string;
        duration: number;
        level: string;
        answer1: string;
        answer2: string;
        answer3: string;
        answer4: string;
        correctAnswer: number;
      }[] = excel['Sheet1'];
      const questions: Question[] = [];
      for (const raw of rawData) {
        //new question
        const question = new Question();
        question.question = raw.question;
        question.duration = raw.duration;
        if (raw.level == 'Khó') {
          question.level = QuestionLevel.Hard;
        } else if (raw.level == 'Bình Thường') {
          question.level = QuestionLevel.Medium;
        } else if (raw.level == 'Dễ') {
          question.level = QuestionLevel.Easy;
        }
        question.imageUrl = raw.imageUrl;
        question.lectureId = lectureId;
        //question's answers
        const answers: Answer[] = [];
        const a1 = new Answer();
        a1.content = raw.answer1;
        const a2 = new Answer();
        a2.content = raw.answer2;
        const a3 = new Answer();
        a3.content = raw.answer3;
        const a4 = new Answer();
        a4.content = raw.answer4;
        answers.push(a1, a2, a3, a4);
        answers[raw.correctAnswer - 1].isCorrect = true;
        question.answers = answers;

        questions.push(question);
      }
      return {
        statusCode: HttpStatus.OK,
        error: null,
        message: 'Teachers added succesfully',
        data: await this.questionService.importQuestion(questions),
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid Excel File Format');
    }
  }
}
