import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateResult } from 'typeorm';
import { UserRepository } from '../user/repository/user.repository';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './repository/lecture.repository';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureRepository)
    private lectureRepository: LectureRepository,
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
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
    const data = await this.lectureRepository.findOne({ id: lectureId });
    if (!data) {
      throw new BadRequestException('Lecture does not exist');
    }
    return data;
  }

  async updateLecture(
    lectureId: number,
    updateLectureDto: UpdateLectureDto,
  ): Promise<UpdateResult> {
    return await this.lectureRepository.update(lectureId, updateLectureDto);
  }

  async getLectureList(
    options: IPaginationOptions,
    ownerId: number,
  ): Promise<Pagination<Lecture>> {
    const query = this.lectureRepository
      .createQueryBuilder()
      .orderBy('id', 'ASC');

    if (ownerId) {
      const user = await this.userRepo.findOne(ownerId);
      //check if user exist
      if (!user) {
        throw new BadRequestException('Lecture owner not exist');
      }
      query.where('owner_id = :ownerId', { ownerId: ownerId });
    }
    return paginate<Lecture>(query, options);
  }
}
