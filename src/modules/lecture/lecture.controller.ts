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
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entity/lecture.entity';
import { LectureService } from './lecture.service';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createQuestion(
    @Body() createLectureDto: CreateLectureDto,
  ): Promise<Lecture> {
    return await this.lectureService.createLecture(createLectureDto);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':lectureId')
  async getQuestionDetail(
    @Param('lectureId') lectureId: number,
  ): Promise<Lecture> {
    return await this.lectureService.getLectureDetail(lectureId);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':lectureId')
  async updateQuestion(
    @Param('lectureId') lectureId: number,
    @Body() updateLectureDto: UpdateLectureDto,
  ): Promise<UpdateResult> {
    return await this.lectureService.updateLecture(lectureId, updateLectureDto);
  }
}
