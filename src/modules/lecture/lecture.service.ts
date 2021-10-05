import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateResult } from 'typeorm';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './repository/lecture.repository';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureRepository)
    private lectureRepository: LectureRepository,
  ) {}

  async createLecture(createLectureDto: CreateLectureDto): Promise<Lecture> {
    const lecture = new Lecture();
    lecture.name = createLectureDto.name;
    lecture.publicity = createLectureDto.publicity;
    lecture.content = createLectureDto.content;
    lecture.ownerId = createLectureDto.ownerId;
    return await lecture.save();
  }

  async getLectureDetail(lectureId: number): Promise<Lecture> {
    return await this.lectureRepository.findOne({ id: lectureId });
  }

  async updateLecture(
    lectureId: number,
    updateLectureDto: UpdateLectureDto,
  ): Promise<UpdateResult> {
    return await this.lectureRepository.update(lectureId, updateLectureDto);
  }
}
