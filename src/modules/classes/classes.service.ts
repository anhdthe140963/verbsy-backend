import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { UpdateResult } from 'typeorm';
import { UserClass } from '../user-class/entity/user-class.entity';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { StudentInfoRepository } from '../user/repository/student-info.repository';
import { UserRepository } from '../user/repository/user.repository';
import { addClassDto } from './dto/add-class.dto';
import { ClassFilter } from './dto/class.filter';
import { CreateClassDto } from './dto/create-classes.dto';
import { UpdateClassDto } from './dto/update-classes.dto';
import { Classes } from './entity/classes.entity';
import { ClassesRepository } from './repository/classes.repository';

@Injectable()
export class ClassesService {
  constructor(
    private classesRepository: ClassesRepository,
    private userRepository: UserRepository,
    private userClassRepo: UserClassRepository,
    private studentInfoRepo: StudentInfoRepository,
  ) {}
  async createClasses(createClassesDto: CreateClassDto): Promise<Classes> {
    const classes = new Classes();
    classes.name = createClassesDto.name;
    classes.teacherId = createClassesDto.teacherId;
    classes.grade = createClassesDto.grade;
    classes.schoolYear = createClassesDto.schoolYear;
    return await classes.save();
  }

  async getClassesDetail(classId: number): Promise<Classes> {
    const data = await this.classesRepository.findOne({ id: classId });
    const teacherFullName = await this.userRepository.findOne({
      where: { id: data.teacherId },
      select: ['fullName'],
    });
    return Object.assign(data, teacherFullName);
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
        where: { name: cl.name, grade: cl.grade, schoolYear: cl.schoolYear },
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
    return {
      addedClasses: addedClasses,
      duplicatedClasses: duplicatedClasses,
    };
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

  async getGrades() {
    const grades = await this.classesRepository
      .createQueryBuilder()
      .select('grade')
      .distinct(true)
      .getRawMany();

    const result = [];
    for (const grade of grades) {
      const classes = await this.classesRepository.find({
        select: ['id', 'name'],
        where: { grade: grade['grade'] },
      });
      result.push({ name: grade['grade'], classes: classes });
    }
    return result;
  }

  async getClassList(options: IPaginationOptions, filter: ClassFilter) {
    const rawPagination = await paginate(this.classesRepository, options, {
      where: filter,
    });
    for (let cl of rawPagination.items) {
      const teacherFullName = await this.userRepository.findOne({
        where: { id: cl.teacherId },
        select: ['fullName'],
      });
      cl = Object.assign(cl, teacherFullName);
    }

    return rawPagination;
  }

  async getStudentByClassId(
    options: IPaginationOptions,
    classId: number,
  ): Promise<Pagination<User>> {
    const query = this.userRepository
      .createQueryBuilder('u')
      .leftJoin(UserClass, 'uc', 'u.id = uc.student_id')
      .where('u.role = :role', { role: Role.Student })
      .andWhere('uc.class_id = :classId', { classId: classId });
    const transfromPaginate = await paginate<User>(query, options);
    await Promise.all(
      transfromPaginate.items.map(async (item) => {
        const studentInfo = await this.studentInfoRepo.findOne({
          userId: item.id,
        });
        item = Object.assign(item, { studentInfo: studentInfo });
      }),
    );
    return transfromPaginate;
  }
}
