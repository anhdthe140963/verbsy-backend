import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { Question } from '../question/entity/question.entity';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entity/lecture.entity';
import { LectureService } from './lecture.service';

@Controller('lecture')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Post()
  async createQuestion(
    @Body() createLectureDto: CreateLectureDto,
  ): Promise<Lecture> {
    return await this.lectureService.createLecture(createLectureDto);
  }

  @Get(':lectureId')
  async getQuestionDetail(
    @Param('lectureId') lectureId: number,
  ): Promise<Lecture> {
    return await this.lectureService.getLectureDetail(lectureId);
  }

  @Put(':lectureId')
  async updateQuestion(
    @Param('lectureId') lectureId: number,
    @Body() updateLectureDto: UpdateLectureDto,
  ): Promise<UpdateResult> {
    return await this.lectureService.updateLecture(lectureId, updateLectureDto);
  }
}
