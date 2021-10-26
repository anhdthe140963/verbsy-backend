import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  paginateRaw,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateResult } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { addClassDto } from './dto/add-class.dto';
import { CreateClassDto } from './dto/create-classes.dto';
import { UpdateClassDto } from './dto/update-classes.dto';
import { Classes } from './entity/classes.entity';
import { ClassesRepository } from './repository/classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassesRepository)
    private classesRepository: ClassesRepository,
    @InjectRepository(UserRepository)
    private userRepo: UserRepository,
  ) {}
  async createClasses(createClassesDto: CreateClassDto): Promise<Classes> {
    const classes = new Classes();
    classes.name = createClassesDto.name;
    classes.teacherId = createClassesDto.teacherId;
    classes.grade = createClassesDto.grade;
    classes.schoolyear = createClassesDto.schoolYear;
    return await classes.save();
  }

  async getClassesDetail(classId: number): Promise<Classes> {
    return await this.classesRepository.findOne({ id: classId });
  }

  async updateClass(
    classId: number,
    updateClassDto: UpdateClassDto,
  ): Promise<UpdateResult> {
    return await this.classesRepository.update(classId, updateClassDto);
  }

  async addClasses(classes: addClassDto[]) {
    const duplicatedClasses: addClassDto[] = [];
    const addedClasses: addClassDto[] = [];
    for (const cl of classes) {
      const duplicatedClass = await this.classesRepository.findOne({
        where: { name: cl.name, grade: cl.grade, schoolyear: cl.schoolyear },
      });

      if (duplicatedClass) {
        duplicatedClasses.push(cl);
      } else {
        try {
          await this.classesRepository.insert(cl);
          addedClasses.push(cl);
        } catch (error) {
          throw new InternalServerErrorException('Error during insertion');
        }
      }
    }
    return await {
      addedClasses: addedClasses,
      duplicatedClasses: duplicatedClasses,
    };
  }
  async getClassList(
    options: IPaginationOptions,
    teacherId: number,
    grade: string,
  ): Promise<Pagination<Classes>> {
    try {
      const query = this.classesRepository
        .createQueryBuilder('c')
        .innerJoin(User, 'u', 'c.teacher_id = u.id')
        .select([
          'c.id',
          'c.name',
          'c.teacher_id',
          'c.grade',
          'c.schoolyear',
          'u.full_name',
        ]);
      if (teacherId) {
        const teacher = await this.userRepo.findOne(teacherId);
        //check if user exist
        if (!teacher) {
          throw new BadRequestException('Teacher not exist');
        }
        query.where('c.teacher_id = :teacherId', { teacherId: teacherId });
      }
      if (grade) {
        query.andWhere('c.grade = :grade', { grade: grade });
      }
      return await paginateRaw(query, options);
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException('Error when getting class list');
    }
  }
  async delete(classId: number) {
    try {
      const data = await this.classesRepository.findOne({ id: classId });
      if (!data) {
        throw new BadRequestException('Class does not exist');
      }
      await this.classesRepository.delete({ id: classId });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getGradeList(): Promise<string[]> {
    try {
      const data = await this.classesRepository
        .createQueryBuilder('c')
        .select('c.grade')
        .distinct()
        .getRawMany();
      return data;
    } catch (error) {
      throw new InternalServerErrorException('Error when getting grade list');
    }
  }
}
