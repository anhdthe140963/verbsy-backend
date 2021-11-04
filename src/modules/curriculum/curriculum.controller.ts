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
import { GetUser } from 'src/decorator/get-user-decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CurriculumFilter } from './dto/curriculum.filter';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { UpdateLesssonDto } from './dto/update-lesson.dto';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async create(
    @GetUser() user,
    @Body() createCurriculumDto: CreateCurriculumDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Curriculum created',
      data: await this.curriculumService.create(user, createCurriculumDto),
    };
  }
  @Post('lesson')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async createLesson(
    @Body() createLessonDto: CreateLessonDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Lesson created',
      data: await this.curriculumService.createLesson(createLessonDto),
    };
  }

  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher, Role.Student)
  async findAll(
    @Query() filter: CurriculumFilter,
  ): Promise<{ statusCode; error; message; data }> {
    const curriFilter: CurriculumFilter = {};
    for (const prop in filter) {
      if (prop != 'page' && prop != 'limit') {
        curriFilter[prop] = filter[prop];
      }
    }
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Get curriculums successfully',
      data: await this.curriculumService.findAll(
        {
          page: filter.page ? filter.page : PaginationEnum.DefaultPage,
          limit: filter.limit ? filter.limit : PaginationEnum.DefaultLimit,
        },
        curriFilter,
      ),
    };
  }

  @Get('lessons/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher, Role.Student)
  async findAllLessonByCurriculumId(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get lessons successfully',
      data: await this.curriculumService.findAllLessonByCurriculumId(id),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher, Role.Student)
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get curriculum successfully',
      data: await this.curriculumService.findOne(id),
    };
  }

  @Post('lesson/swap')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async swapLessonPosition(
    @Body() swapDto: { id1: number; id2: number },
  ): Promise<{ statusCode; error; message }> {
    await this.curriculumService.swapLessonPosition(swapDto.id1, swapDto.id2);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Swap position successfully',
    };
  }

  @Get('lesson/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher, Role.Student)
  async findOneLesson(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get lesson successfully',
      data: await this.curriculumService.findOneLesson(id),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async update(
    @Param('id') id: number,
    @Body() updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Curriculum updated',
      data: await this.curriculumService.update(id, updateCurriculumDto),
    };
  }
  @Put('lesson/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async updateLesson(
    @Param('id') id: number,
    @Body() updateLessonDto: UpdateLesssonDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Lesson updated',
      data: await this.curriculumService.updateLesson(id, updateLessonDto),
    };
  }
  @Delete(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message }> {
    await this.curriculumService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Curriculum deleted',
    };
  }
  @Delete('lesson/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  async removeLesson(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message }> {
    await this.curriculumService.removeLesson(id);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Lesson deleted',
    };
  }
}
