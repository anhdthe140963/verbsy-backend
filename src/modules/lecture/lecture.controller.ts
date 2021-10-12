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
import { PaginationEnum } from '../../constant/pagination.enum';
import { Role } from '../../constant/role.enum';
import { Roles } from '../../decorator/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { GetLecturesFilter } from './dto/get-lectures.filter';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { LectureService } from './lecture.service';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createQuestion(
    @Body() createLectureDto: CreateLectureDto,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.lectureService.createLecture(createLectureDto);
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: null,
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('list')
  async getLectureList(
    @Query() filter: GetLecturesFilter,
  ): Promise<{ statusCode; error; message; data }> {
    filter.page = filter.page ? filter.page : PaginationEnum.DefaultPage;
    filter.limit = filter.limit ? filter.limit : PaginationEnum.DefaultLimit;
    const data = await this.lectureService.getLectureList(
      { page: filter.page, limit: filter.limit },
      filter.ownerId,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: null,
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':lectureId')
  async update(
    @Param('lectureId') lectureId: number,
    @Body() updateLectureDto: UpdateLectureDto,
  ): Promise<{ statusCode; error; message }> {
    await this.lectureService.updateLecture(lectureId, updateLectureDto);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: null,
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':lectureId')
  async getLectureDetail(
    @Param('lectureId') lectureId: number,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.lectureService.getLectureDetail(lectureId);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: null,
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Delete(':lectureId')
  async delete(
    @Param('lectureId') lectureId: number,
  ): Promise<{ statusCode; error; message }> {
    await this.lectureService.delete(lectureId);
    return { statusCode: HttpStatus.OK, error: null, message: null };
  }
}
