import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { UpdateResult } from 'typeorm';
import { Grade } from '../grade/entities/grade.entity';
import { GradeRepository } from '../grade/repository/grade.repository';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';
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
    private userClassRepository: UserClassRepository,
    private studentInfoRepo: StudentInfoRepository,
    private gradeRepository: GradeRepository,
    private schoolYearRepository: SchoolYearRepository,
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
      let data = await this.classesRepository.findOne({ id: classId });
      if (!data) {
        throw new NotFoundException('Class does not exist');
      }
      const teachers = await this.userClassRepository
        .createQueryBuilder('u')
        .where('u.teacher_id IS NOT NULL')
        .andWhere('u.class_id = :classId', { classId: data.id })
        .getMany();
      if (teachers.length != 0) {
        const ids = new Set();
        for (const teacher of teachers) {
          ids.add(teacher.teacherId);
        }
        const teacherFullNames = await this.userRepository
          .createQueryBuilder('u')
          .select(['u.id', 'u.fullName'])
          .where('u.id IN (:...ids)', { ids: [...ids] })
          .getMany();

        data = Object.assign(data, { teachers: teacherFullNames });
      }
      return data;
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
        const grade = await this.gradeRepository.findOne(
          updateClassDto.gradeId,
        );
        if (!grade) {
          throw new NotFoundException('Grade not exist');
        }
      }
      //check school year
      if (updateClassDto.schoolYearId) {
        const schoolYear = await this.schoolYearRepository.findOne(
          updateClassDto.schoolYearId,
        );
        if (!schoolYear) {
          throw new NotFoundException('School year not exist');
        }
      }
      const teacherIds = updateClassDto.teacherIds;
      delete updateClassDto.teacherIds;
      //check if update teacherIds
      if (teacherIds) {
        await this.userClassRepository
          .createQueryBuilder()
          .where('teacher_id IS NOT NULL')
          .andWhere('class_id = :classId', { classId: data.id })
          .delete()
          .execute();
        //check teacherids
        if (teacherIds.length != 0) {
          //check if teacher exist
          for (const id of teacherIds) {
            const user = await this.userRepository.findOne(id);
            if (!user) {
              throw new NotFoundException('Teacher not exist');
            }
          }
          for (const id of teacherIds) {
            const userClass = new UserClass();
            userClass.teacherId = id;
            userClass.classId = data.id;
            await userClass.save();
          }
        }
      }
      return await this.classesRepository.update(classId, updateClassDto);
    } catch (error) {
      throw error;
    }
  }

  async importClasses(classes: addClassDto[], schoolYearId: number) {
    const duplicatedClasses: addClassDto[] = [];
    const addedClasses: addClassDto[] = [];
    for (const cl of classes) {
      let grade = await this.gradeRepository.findOne({
        where: { name: cl.grade },
      });
      const schoolYear = await this.schoolYearRepository.findOne(schoolYearId);
      const duplicatedClass = await this.classesRepository.findOne({
        where: {
          name: cl.name,
          gradeId: grade ? grade.id : -1,
          schoolYearId: schoolYear ? schoolYear.id : -1,
        },
      });

      if (duplicatedClass) {
        duplicatedClasses.push(cl);
      } else {
        try {
          if (!grade) {
            await this.gradeRepository.insert({ name: cl.grade });
            grade = await this.gradeRepository.findOne({ name: cl.grade });
          }
          const schoolYear = await this.schoolYearRepository.findOne(
            schoolYearId,
          );
          if (!schoolYear) {
            throw new BadRequestException('School year not exist');
          }
          // await this.classesRepository.insert(cl);
          await this.classesRepository.insert({
            name: cl.name,
            gradeId: grade.id,
            schoolYearId: schoolYear.id,
          });
          addedClasses.push(cl);
        } catch (error) {
          console.log(error);
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
      await this.userClassRepository
        .createQueryBuilder()
        .where('class_id = :classId', { classId: data.id })
        .delete()
        .execute();
      await this.classesRepository.delete({ id: classId });
    } catch (error) {
      throw error;
    }
  }

  async getClassList(
    options: IPaginationOptions,
    filter: ClassFilter,
    user: User,
  ) {
    filter.schoolYearId =
      filter.schoolYearId ??
      (await this.schoolYearRepository.findOne({ where: { isActive: true } }))
        .id;
    let rawPagination;
    if (user.role == Role.Administrator) {
      rawPagination = await paginate(this.classesRepository, options, {
        where: filter,
      });
    } else {
      const userClasses = await this.userClassRepository.find({
        teacherId: user.id,
      });
      const classIds = [];
      for (const uc of userClasses) {
        classIds.push(uc.classId);
      }
      const query = await this.classesRepository
        .createQueryBuilder()
        .where('id IN (:...ids)', { ids: classIds });
      rawPagination = await paginate(query, options);
    }
    await Promise.all(
      rawPagination.items.map(async (cl: Classes) => {
        const teachers = await this.userClassRepository
          .createQueryBuilder('u')
          .where('u.teacher_id IS NOT NULL')
          .andWhere('u.class_id = :classId', { classId: cl.id })
          .getMany();
        if (teachers.length !== 0) {
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
        }
      }),
    );
    return rawPagination;
  }

  async getClassListByTeacherId(teacherId: number) {
    try {
      const userclasses = await this.userClassRepository.find({
        teacherId: teacherId,
      });
      const classIds = new Set();
      //get class ids of teacher
      for (const uc of userclasses) {
        classIds.add(uc.classId);
      }
      const classes = await this.classesRepository
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: [...classIds] })
        .getMany();

      await Promise.all(
        classes.map(async (cl: Classes) => {
          const teachers = await this.userClassRepository
            .createQueryBuilder('u')
            .where('u.teacher_id IS NOT NULL')
            .andWhere('u.class_id = :classId', { classId: cl.id })
            .getMany();
          if (teachers.length !== 0) {
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
          }
        }),
      );
      return classes;
    } catch (error) {
      throw error;
    }
  }

  async getTeachingClasses(gradeId: number, userId: number) {
    try {
      const userclasses = await this.userClassRepository.find({
        teacherId: userId,
      });
      const classIds = new Set();
      //get class ids of teacher
      for (const uc of userclasses) {
        classIds.add(uc.classId);
      }
      const classes = await this.classesRepository
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: [...classIds] })
        .andWhere('c.grade_id = :id', { id: gradeId })
        .getMany();

      await Promise.all(
        classes.map(async (cl: Classes) => {
          const teachers = await this.userClassRepository
            .createQueryBuilder('u')
            .where('u.teacher_id IS NOT NULL')
            .andWhere('u.class_id = :classId', { classId: cl.id })
            .getMany();
          if (teachers.length !== 0) {
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
          }
        }),
      );
      return classes;
    } catch (error) {
      throw error;
    }
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

  async getAllClasses(
    teacherId?: number,
    gradeId?: number,
    schoolYearId?: number,
  ) {
    console.log(teacherId, gradeId, schoolYearId);

    const schoolYears = schoolYearId
      ? [await this.schoolYearRepository.findOne(schoolYearId)]
      : await this.schoolYearRepository.find({ order: { isActive: 'DESC' } });

    const grades = gradeId
      ? [await this.gradeRepository.findOne(gradeId)]
      : await this.gradeRepository.find();

    const allClasses: {
      schoolYear: {
        id: number;
        name: string;
        isActive: boolean;
        grades: {
          id: number;
          name: string;
          classes: Classes[];
        }[];
      }[];
    }[] = [];

    // const allClasses = [];
    for (const s of schoolYears) {
      const gradesWithClasses: {
        id: number;
        name: string;
        classes: Classes[];
      }[] = [];
      for (const g of grades) {
        const classes = teacherId
          ? await this.classesRepository
              .createQueryBuilder('c')
              .innerJoin(UserClass, 'uc', 'c.id = uc.class_id')
              .where('uc.teacher_id =:teacherId', { teacherId })
              .andWhere('c.grade_id =:gradeId', { gradeId: g.id })
              .andWhere('c.school_year_id =:schoolYearId', {
                schoolYearId: s.id,
              })
              .getMany()
          : await this.classesRepository.find({
              select: ['id', 'name'],
              where: { gradeId: g.id, schoolYearId: s.id },
            });
        gradesWithClasses.push({ ...g, classes: classes });
      }
      allClasses.push({
        schoolYear: [{ ...s, grades: gradesWithClasses }],
      });
    }

    return allClasses;
  }

  async getTeacherClasses(teacherId: number) {
    const classes = await this.classesRepository
      .createQueryBuilder('c')
      .innerJoin(SchoolYear, 's', 'c.school_year_id = s.id')
      .innerJoin(UserClass, 'uc', 'c.id = uc.class_id')
      .where('uc.teacher_id =:teacherId', { teacherId })
      .andWhere('s.is_active = true')
      .getMany();

    return classes;
  }
}
