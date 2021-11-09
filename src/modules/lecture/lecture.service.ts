import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { UpdateResult } from 'typeorm';
import { LessonRepository } from '../lesson/repository/lesson.repository';
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
    private lessonRepo: LessonRepository,
  ) {}

  async createLecture(createLectureDto: CreateLectureDto): Promise<Lecture> {
    const lecture = new Lecture();
    const user = await this.userRepo.findOne(createLectureDto.ownerId);
    if (!user) {
      throw new NotFoundException('Owner not exist');
    }
    if (user.role == Role.Student) {
      throw new BadRequestException('Owner can not be a student');
    }
    const lesson = await this.lessonRepo.findOne(createLectureDto.lessonId);
    if (!lesson) {
      throw new NotFoundException('Lesson not exist');
    }
    lecture.name = createLectureDto.name;
    lecture.content = createLectureDto.content;
    lecture.ownerId = createLectureDto.ownerId;
    lecture.lessonId = createLectureDto.lessonId;
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
    if (updateLectureDto.ownerId) {
      const user = await this.userRepo.findOne(updateLectureDto.ownerId);
      if (!user) {
        throw new NotFoundException('Owner not exist');
      }
      if (user.role == Role.Student) {
        throw new BadRequestException('Owner can not be a student');
      }
    }
    if (updateLectureDto.lessonId) {
      const lesson = await this.lectureRepository.findOne(
        updateLectureDto.lessonId,
      );
      if (!lesson) {
        throw new NotFoundException('Lesson not exist');
      }
    }
    return await this.lectureRepository.update(lectureId, updateLectureDto);
  }

  async getLectureList(
    options: IPaginationOptions,
    ownerId: number,
  ): Promise<Pagination<Lecture>> {
    const query = this.lectureRepository
      .createQueryBuilder()
      .orderBy('createAt', 'DESC');

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

  async delete(lectureId: number) {
    const data = await this.lectureRepository.findOne({ id: lectureId });
    //check if lecture exist
    if (!data) {
      throw new BadRequestException('Lecture does not exist');
    }
    await this.lectureRepository.delete({ id: lectureId });
  }
}
