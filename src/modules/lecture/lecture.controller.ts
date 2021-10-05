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
import { CreateLectureDto } from './dto/create-lecture.dto';
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
  @Get(':lectureId')
  async getLectureList(
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
  @Put(':lectureId')
  async updateQuestion(
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
}
