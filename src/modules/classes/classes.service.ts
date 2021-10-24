import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateResult } from 'typeorm';
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
  ): Promise<Pagination<Classes>> {
    if (teacherId) {
      const teacher = await this.userRepo.findOne(teacherId);
      //check if user exist
      if (!teacher) {
        throw new BadRequestException('Teacher not exist');
      }
    }
    return await paginate<Classes>(this.classesRepository, options, {
      where: `teacher_id = ${teacherId}`,
    });
  }
}
