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
import { QuestionLevel } from 'src/constant/question-level.enum';
import { Role } from 'src/constant/role.enum';
import { UpdateResult } from 'typeorm';
import { CurriculumRepository } from '../curriculum/repository/curriculum.repository';
import { LessonLecture } from '../lesson-lecture/entities/lesson-lecture.entity';
import { LessonLectureRepository } from '../lesson-lecture/repository/lesson-lecture.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { CreateLectureDto } from './dto/create-lecture.dto';
import { UpdateLectureDto } from './dto/update-lecture.dto';
import { Lecture } from './entity/lecture.entity';
import { LectureRepository } from './repository/lecture.repository';

@Injectable()
export class LectureService {
  constructor(
    private lectureRepository: LectureRepository,
    private readonly quesitonRepository: QuestionRepository,
    private userRepository: UserRepository,
    private lessonRepository: LessonRepository,
    private curriculumRepository: CurriculumRepository,
    private lessonLectureRepository: LessonLectureRepository,
  ) {}

  async createLecture(
    createLectureDto: CreateLectureDto,
    user: User,
  ): Promise<Lecture> {
    try {
      const lecture = new Lecture();
      if (user.role == Role.Student) {
        throw new BadRequestException('Owner can not be a student');
      }
      lecture.name = createLectureDto.name;
      lecture.content = createLectureDto.content;
      lecture.ownerId = user.id;
      await lecture.save();

      const lessonLecture = new LessonLecture();
      lessonLecture.lectureId = lecture.id;
      lessonLecture.lessonId = createLectureDto.lessonId;
      await lessonLecture.save();

      Object.assign(lecture, { lessonId: createLectureDto.lessonId });
      return lecture;
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
      const user = await this.userRepository.findOne(data.ownerId);
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
        const user = await this.userRepository.findOne(
          updateLectureDto.ownerId,
        );
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
        .orderBy('createAt', 'ASC');

      if (ownerId) {
        const user = await this.userRepository.findOne(ownerId);
        //check if user exist
        if (!user) {
          throw new NotFoundException('Lecture owner not exist');
        }
      }

      if (lessonId) {
        const lesson = await this.lessonRepository.findOne(lessonId);
        if (!lesson) {
          throw new NotFoundException('Lesson not exist');
        }
        query.innerJoin(LessonLecture, 'll', 'lt.id = ll.lecture_id');
      }

      if (ownerId) {
        query.where('lt.owner_id = :ownerId', { ownerId: ownerId });
      }
      if (lessonId) {
        query.andWhere('ll.lesson_id = :id', { id: lessonId });
      }
      const pagiData = await paginate<Lecture>(query, options);
      for (const lecture of pagiData.items) {
        const user = await this.userRepository.findOne(lecture.ownerId);
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
      await this.lessonLectureRepository.delete({ lectureId: lectureId });
      await this.lectureRepository.delete({ id: lectureId });
    } catch (error) {
      throw error;
    }
  }

  async getLectureByClassId(classId: number): Promise<Lecture[]> {
    const curriculumsByClassId =
      await this.curriculumRepository.getCurriculumByClassId(classId);
    const lessonIds = new Set();
    for (const curriculum of curriculumsByClassId) {
      const lessons = await this.lessonRepository.getLessonByCurriculumId(
        curriculum.id,
      );
      for (const lesson of lessons) {
        lessonIds.add(lesson.id);
      }
    }
    const lectureIds = [];
    for (const id of lessonIds) {
      const lessonLectures =
        await this.lessonLectureRepository.getLessonLectureByLessonId(id);
      for (const ll of lessonLectures) {
        lectureIds.push(ll.lectureId);
      }
    }
    return await this.lectureRepository.getLecturesByLectureIds(lectureIds);
  }

  async getLectureQuestionsInfo(lectureId: number) {
    const easyCount = await this.quesitonRepository.count({
      where: { lectureId, level: QuestionLevel.Easy },
    });
    const mediumCount = await this.quesitonRepository.count({
      where: { lectureId, level: QuestionLevel.Medium },
    });
    const hardCount = await this.quesitonRepository.count({
      where: { lectureId, level: QuestionLevel.Hard },
    });

    return {
      questions: easyCount + mediumCount + hardCount,
      easyCount,
      mediumCount,
      hardCount,
    };
  }
}
