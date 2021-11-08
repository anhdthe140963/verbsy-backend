import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Grade } from '../grade/entities/grade.entity';
import { LessonMaterial } from '../lesson-material/entities/lesson-material.entity';
import { LessonMaterialRepository } from '../lesson-material/repository/lesson-material.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CurriculumFilter } from './dto/curriculum.filter';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { UpdateLesssonDto } from './dto/update-lesson.dto';
import { Curriculum } from './entities/curriculum.entity';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumRepo: Repository<Curriculum>,
    private userRepo: UserRepository,
    private classRepo: ClassesRepository,
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    private lessonMaterialRepo: LessonMaterialRepository,
  ) {}
  async create(
    user: User,
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<Curriculum> {
    try {
      const { name, gradeId, classId, parentId } = createCurriculumDto;
      const curriculum = new Curriculum();
      curriculum.name = name;
      curriculum.createdBy = user.id;
      //check grade id
      if (gradeId) {
        const grade = await this.gradeRepo.findOne(gradeId);
        if (!grade) {
          throw new NotFoundException('Grade not found');
        }
        curriculum.gradeId = gradeId;
      }
      //check class id
      if (classId) {
        const classById = await this.classRepo.findOne(classId);
        if (!classById) {
          throw new NotFoundException('Class not found');
        }
        if (classById.gradeId !== gradeId) {
          throw new NotFoundException('Class not in selected grade');
        }
        curriculum.classId = classId;
      }
      //check parent id, if curriculum does not have parent id means its a template
      if (parentId) {
        const curriculumById = await this.curriculumRepo.findOne(parentId);
        if (!curriculumById) {
          throw new NotFoundException('Curriculum not found');
        }
        curriculum.parentId = parentId;
        const curri = await curriculum.save();
        const lessons = await this.lessonRepo
          .createQueryBuilder()
          .where('curriculum_id = :id', { id: curri.id })
          .getMany();
        //clone curriculum's lessons
        for (const lesson of lessons) {
          const ls = new Lesson();
          ls.name = lesson.name;
          ls.position = lesson.position;
          ls.curriculumId = curri.id;
          await ls.save();
          //clone lesson's material
          const lessonMaterials = await this.lessonMaterialRepo
            .createQueryBuilder()
            .where('lesson_id = :id', { id: lesson.id })
            .getMany();
          await Promise.all(
            lessonMaterials.map(async (lessonMaterial: LessonMaterial) => {
              await this.lessonMaterialRepo.insert({
                displayName: lessonMaterial.displayName,
                url: lessonMaterial.url,
                uploaderId: lessonMaterial.uploaderId,
                lessonId: ls.id,
              });
            }),
          );
        }
      }
      return await curriculum.save();
    } catch (error) {
      throw error;
    }
  }

  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    try {
      //check curriculum
      const curri = await this.curriculumRepo.findOne(
        createLessonDto.curriculumId,
      );
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      const newLesson = new Lesson();
      newLesson.curriculumId = createLessonDto.curriculumId;
      newLesson.name = createLessonDto.name;
      //get max position value
      const lessonNumber = await this.lessonRepo
        .createQueryBuilder('l')
        .select('MAX(l.position)', 'max')
        .where('l.curriculum_id = :id', { id: createLessonDto.curriculumId })
        .getRawOne();
      if (!lessonNumber['max']) {
        newLesson.position = 1;
      } else {
        newLesson.position = lessonNumber['max'] + 1;
      }
      return await newLesson.save();
    } catch (error) {
      throw error;
    }
  }

  async findAll(options: IPaginationOptions, filter: CurriculumFilter) {
    try {
      const rawPagination = await paginate(this.curriculumRepo, options, {
        where: filter,
      });
      for (const curri of rawPagination.items) {
        const createrName = await this.userRepo
          .createQueryBuilder('u')
          .select('u.fullName')
          .where('u.id = :id', { id: curri.createdBy })
          .getOne();
        Object.assign(curri, { creatorName: createrName['fullName'] });
      }
      return rawPagination;
    } catch (error) {
      throw error;
    }
  }

  async findAllLessonByCurriculumId(id: number): Promise<Lesson[]> {
    try {
      const data = await this.curriculumRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Curriculum not exist');
      }
      const lessons = await this.lessonRepo
        .createQueryBuilder()
        .where('curriculum_id = :id', { id: id })
        .orderBy('position', 'ASC')
        .getMany();
      for (const lesson of lessons) {
        const lessonMaterials = await this.lessonMaterialRepo.find({
          lessonId: lesson.id,
        });
        Object.assign(lesson, { lessonMaterials: lessonMaterials });
      }
      return lessons;
    } catch (error) {
      throw error;
    }
  }

  async swapLessonPosition(id1: number, id2: number) {
    try {
      const data1 = await this.lessonRepo.findOne(id1);
      if (!data1) {
        throw new NotFoundException(`Lesson with id ${id1} not exist`);
      }
      const data2 = await this.lessonRepo.findOne(id2);
      if (!data2) {
        throw new NotFoundException(`Lesson with id ${id2} not exist`);
      }
      if (data1.curriculumId != data2.curriculumId) {
        throw new BadRequestException('Lesson not in same curriculum');
      }
      //swap values
      [data1.position, data2.position] = [data2.position, data1.position];
      await data1.save();
      await data2.save();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Curriculum> {
    try {
      const data = await this.curriculumRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Curriculum not exist');
      }
      const createrName = await this.userRepo
        .createQueryBuilder('u')
        .select('u.fullName')
        .where('u.id = :id', { id: data.createdBy })
        .getOne();
      Object.assign(data, { creatorName: createrName['fullName'] });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findOneLesson(id: number): Promise<Lesson> {
    try {
      const data = await this.lessonRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Lesson not exist');
      }
      const lessonMaterials = await this.lessonMaterialRepo.find({
        lessonId: data.id,
      });
      Object.assign(data, { lessonMaterials: lessonMaterials });
      return data;
    } catch (error) {
      throw error;
    }
  }
  async update(
    id: number,
    updateCurriculumDto: UpdateCurriculumDto,
  ): Promise<Curriculum> {
    try {
      const { gradeId, classId, parentId } = updateCurriculumDto;
      //check curriculum
      const curri = await this.curriculumRepo.findOne(id);
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      if (gradeId) {
        //check grade id
        const grade = await this.gradeRepo.findOne(gradeId);
        if (!grade) {
          throw new NotFoundException('Grade not found');
        }
      }
      //check class id
      if (classId) {
        const classById = await this.classRepo.findOne(classId);
        if (!classById) {
          throw new NotFoundException('Class not found');
        }
        if (classById.gradeId !== gradeId) {
          throw new NotFoundException('Class not in selected grade');
        }
      }
      //check parent id, if curriculum does not have parent id means its a template
      if (parentId) {
        const curriculumById = await this.curriculumRepo.findOne(parentId);
        if (!curriculumById) {
          throw new NotFoundException('Parent curriculum not found');
        }
      }
      if (parentId == id) {
        throw new BadRequestException('Can not clone itself');
      }
      await this.curriculumRepo.update(id, updateCurriculumDto);
      return await this.curriculumRepo.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async updateLesson(
    id: number,
    updateLessonDto: UpdateLesssonDto,
  ): Promise<Lesson> {
    try {
      const data = await this.lessonRepo.findOne(id);
      if (!data) {
        throw new NotFoundException('Lesson not exist');
      }
      await this.lessonRepo.update(id, updateLessonDto);
      return await this.lessonRepo.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      //check curriculum
      const curri = await this.curriculumRepo.findOne(id);
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      const lessons = await this.lessonRepo
        .createQueryBuilder()
        .where('curriculum_id = :id', { id: curri.id })
        .getMany();
      for (const lesson of lessons) {
        await this.lessonMaterialRepo
          .createQueryBuilder()
          .delete()
          .where('lesson_id = :id', { id: lesson.id })
          .execute();
      }
      await this.curriculumRepo.delete(id);
      await this.lessonRepo
        .createQueryBuilder()
        .delete()
        .where('curriculum_id = :id', { id: id })
        .execute();
    } catch (error) {
      throw error;
    }
  }

  async removeLesson(id: number) {
    try {
      //check lesson
      const lesson = await this.lessonRepo.findOne(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      await this.lessonMaterialRepo
        .createQueryBuilder()
        .delete()
        .where('lesson_id = :id', { id: lesson.id })
        .execute();
      await this.lessonRepo.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
