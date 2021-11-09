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
import { LessonLecture } from '../lesson-lecture/entities/lesson-lecture.entity';
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
    try {
      const lecture = new Lecture();
      const user = await this.userRepo.findOne(createLectureDto.ownerId);
      if (!user) {
        throw new NotFoundException('Owner not exist');
      }
      if (user.role == Role.Student) {
        throw new BadRequestException('Owner can not be a student');
      }
      lecture.name = createLectureDto.name;
      lecture.content = createLectureDto.content;
      lecture.ownerId = createLectureDto.ownerId;
      return await lecture.save();
    } catch (error) {
      throw error;
    }
  }

  async getLectureDetail(lectureId: number): Promise<Lecture> {
    try {
      const data = await this.lectureRepository.findOne({ id: lectureId });
      if (!data) {
        throw new BadRequestException('Lecture does not exist');
      }
      const user = await this.userRepo.findOne(data.ownerId);
      Object.assign(data, { ownerName: user.fullName });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateLecture(
    lectureId: number,
    updateLectureDto: UpdateLectureDto,
  ): Promise<UpdateResult> {
    try {
      if (updateLectureDto.ownerId) {
        const user = await this.userRepo.findOne(updateLectureDto.ownerId);
        if (!user) {
          throw new NotFoundException('Owner not exist');
        }
        if (user.role == Role.Student) {
          throw new BadRequestException('Owner can not be a student');
        }
      }
      return await this.lectureRepository.update(lectureId, updateLectureDto);
    } catch (error) {
      throw error;
    }
  }

  async getLectureList(
    options: IPaginationOptions,
    ownerId: number,
    lessonId: number,
  ): Promise<Pagination<Lecture>> {
    try {
      const query = this.lectureRepository
        .createQueryBuilder('lt')
        .innerJoin(LessonLecture, 'll', 'lt.id = ll.lecture_id')
        .orderBy('createAt', 'DESC');

      if (ownerId) {
        const user = await this.userRepo.findOne(ownerId);
        //check if user exist
        if (!user) {
          throw new NotFoundException('Lecture owner not exist');
        }
        query.where('lt.owner_id = :ownerId', { ownerId: ownerId });
      }
      if (lessonId) {
        const lesson = await this.lessonRepo.findOne(lessonId);
        if (!lesson) {
          throw new NotFoundException('Lesson not exist');
        }
        query.andWhere('ll.lesson_id = :id', { id: lessonId });
      }
      const pagiData = await paginate<Lecture>(query, options);
      for (const lecture of pagiData.items) {
        const user = await this.userRepo.findOne(lecture.ownerId);
        Object.assign(lecture, { ownerName: user.fullName });
      }
      return pagiData;
    } catch (error) {
      throw error;
    }
  }

  async delete(lectureId: number) {
    try {
      const data = await this.lectureRepository.findOne({ id: lectureId });
      //check if lecture exist
      if (!data) {
        throw new BadRequestException('Lecture does not exist');
      }
      await this.lectureRepository.delete({ id: lectureId });
    } catch (error) {
      throw error;
    }
  }
}
