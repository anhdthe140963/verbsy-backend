import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { Repository, UpdateResult } from 'typeorm';
import { Grade } from '../grade/entities/grade.entity';
import { SchoolYear } from '../school-year/entities/school-year.entity';
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
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    @InjectRepository(SchoolYear)
    private schoolYearRepo: Repository<SchoolYear>,
  ) {}
  async createClasses(createClassesDto: CreateClassDto): Promise<Classes> {
    try {
      let classes = new Classes();
      classes.name = createClassesDto.name;
      classes.gradeId = createClassesDto.gradeId;
      classes.schoolYearId = createClassesDto.schoolYearId;
      classes = await classes.save();
      //check if teacher exist
      for (const id of createClassesDto.teacherIds) {
        const user = await this.userRepository.findOne(id);
        if (!user) {
          await classes.remove();
          throw new NotFoundException('Teacher not exist');
        }
      }
      await Promise.all(
        createClassesDto.teacherIds.map(async (id: number) => {
          const userClass = new UserClass();
          userClass.teacherId = id;
          userClass.classId = classes.id;
          await userClass.save();
        }),
      );
      return await classes.save();
    } catch (error) {
      throw error;
    }
  }

  async getClassesDetail(classId: number): Promise<Classes> {
    try {
      const data = await this.classesRepository.findOne({ id: classId });
      if (!data) {
        throw new NotFoundException('Class does not exist');
      }
      const teachers = await this.userClassRepo
        .createQueryBuilder('u')
        .where('u.teacher_id IS NOT NULL')
        .andWhere('u.class_id = :classId', { classId: data.id })
        .getMany();
      const ids = new Set();
      for (const teacher of teachers) {
        ids.add(teacher.teacherId);
      }
      const teacherFullNames = await this.userRepository
        .createQueryBuilder('u')
        .select(['u.id', 'u.fullName'])
        .where('u.id IN (:...ids)', { ids: [...ids] })
        .getMany();

      return Object.assign(data, { teachers: teacherFullNames });
    } catch (error) {
      throw error;
    }
  }

  async updateClass(
    classId: number,
    updateClassDto: UpdateClassDto,
  ): Promise<UpdateResult> {
    try {
      //check class
      const data = await this.classesRepository.findOne({ id: classId });
      if (!data) {
        throw new NotFoundException('Class not exist');
      }
      //check grade
      if (updateClassDto.gradeId) {
        const grade = this.gradeRepo.findOne(updateClassDto.gradeId);
        if (!grade) {
          throw new NotFoundException('Grade not exist');
        }
      }
      //check school year
      if (updateClassDto.schoolYearId) {
        const schoolYear = this.schoolYearRepo.findOne(
          updateClassDto.schoolYearId,
        );
        if (!schoolYear) {
          throw new NotFoundException('School year not exist');
        }
      }
      const teacherIds = updateClassDto.teacherIds;
      delete updateClassDto.teacherIds;
      console.log(teacherIds);

      return await this.classesRepository.update(classId, updateClassDto);
    } catch (error) {
      throw error;
    }
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
      await this.userClassRepo
        .createQueryBuilder()
        .where('class_id = :classId', { classId: data.id })
        .delete()
        .execute();
      await this.classesRepository.delete({ id: classId });
    } catch (error) {
      throw error;
    }
  }

  async getClassList(options: IPaginationOptions, filter: ClassFilter) {
    const rawPagination = await paginate(this.classesRepository, options, {
      where: filter,
    });
    await Promise.all(
      rawPagination.items.map(async (cl: Classes) => {
        const teachers = await this.userClassRepo
          .createQueryBuilder('u')
          .where('u.teacher_id IS NOT NULL')
          .andWhere('u.class_id = :classId', { classId: cl.id })
          .getMany();
        const ids = new Set();
        for (const teacher of teachers) {
          ids.add(teacher.teacherId);
        }
        const teacherFullNames = await this.userRepository
          .createQueryBuilder('u')
          .select(['u.id', 'u.fullName'])
          .where('u.id IN (:...ids)', { ids: [...ids] })
          .getMany();
        cl = Object.assign(cl, { teacherFullNames: teacherFullNames });
      }),
    );
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
