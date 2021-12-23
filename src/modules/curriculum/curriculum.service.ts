import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IPaginationOptions,
  paginate,
  paginateRaw,
  PaginationTypeEnum,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { Brackets } from 'typeorm';
import { Classes } from '../classes/entity/classes.entity';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Grade } from '../grade/entities/grade.entity';
import { GradeRepository } from '../grade/repository/grade.repository';
import { Lecture } from '../lecture/entity/lecture.entity';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLecture } from '../lesson-lecture/entities/lesson-lecture.entity';
import { LessonLectureRepository } from '../lesson-lecture/repository/lesson-lecture.repository';
import { LessonMaterialRepository } from '../lesson-material/repository/lesson-material.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';
import { Question } from '../question/entity/question.entity';
import { AnswerRepository } from '../question/repository/answer.repository';
import { QuestionRepository } from '../question/repository/question.repository';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { User } from '../user/entity/user.entity';
import { UserRepository } from '../user/repository/user.repository';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CurriculumFilter } from './dto/curriculum.filter';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { UpdateLesssonDto } from './dto/update-lesson.dto';
import { Curriculum } from './entities/curriculum.entity';
import { Lesson } from './entities/lesson.entity';
import { CurriculumRepository } from './repository/curriculum.repository';
import { PaginationEnum } from '../../constant/pagination.enum';

@Injectable()
export class CurriculumService {
  constructor(
    private readonly curriculumRepository: CurriculumRepository,
    private readonly userRepository: UserRepository,
    private readonly classesRepository: ClassesRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly lessonMaterialRepository: LessonMaterialRepository,
    private readonly lessonLectureRepository: LessonLectureRepository,
    private readonly lectureRepository: LectureRepository,
    private readonly userClassRepository: UserClassRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly answerRepository: AnswerRepository,
    private readonly gradeRepository: GradeRepository,
    private readonly schoolYearRepository: SchoolYearRepository,
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
        const grade = await this.gradeRepository.findOne(gradeId);
        if (!grade) {
          throw new NotFoundException('Grade not found');
        }
        curriculum.gradeId = gradeId;
      }
      //check class id
      if (classId) {
        const classById = await this.classesRepository.findOne(classId);
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
        const curriculumById = await this.curriculumRepository.findOne(
          parentId,
        );
        if (!curriculumById) {
          throw new NotFoundException('Curriculum not found');
        }
        curriculum.parentId = parentId;
        const curri = await curriculum.save();
        const lessons = await this.lessonRepository
          .createQueryBuilder()
          .where('curriculum_id = :curriculumId', {
            curriculumId: curriculumById.id,
          })
          .getMany();
        //clone curriculum's lessons
        for (const lesson of lessons) {
          const ls = new Lesson();
          ls.name = lesson.name;
          ls.position = lesson.position;
          ls.curriculumId = curri.id;
          await ls.save();
          //clone lesson's material
          const lessonMaterials = await this.lessonMaterialRepository
            .createQueryBuilder()
            .where('lesson_id = :lessonId', { lessonId: lesson.id })
            .getMany();
          for (const lessonMaterial of lessonMaterials) {
            await this.lessonMaterialRepository.insert({
              displayName: lessonMaterial.displayName,
              url: lessonMaterial.url,
              uploaderId: lessonMaterial.uploaderId,
              lessonId: ls.id,
            });
          }
          //clone lectures
          const lessonLectures = await this.lessonLectureRepository
            .createQueryBuilder()
            .where('lesson_id = :lessonId', { lessonId: lesson.id })
            .getMany();
          for (const ll of lessonLectures) {
            //clone lecture
            const lecture = await this.lectureRepository.findOne(ll.lectureId);
            const newLec = new Lecture();
            newLec.name = lecture.name;
            newLec.ownerId = user.id;
            await newLec.save();
            await this.lessonLectureRepository.insert({
              lessonId: ls.id,
              lectureId: newLec.id,
            });

            //clone lecture's question
            const questions = await this.questionRepository.find({
              lectureId: lecture.id,
            });
            for (const question of questions) {
              const newQ = new Question();
              newQ.lectureId = newLec.id;
              newQ.question = question.question;
              newQ.imageUrl = question.imageUrl;
              newQ.duration = question.duration;
              await newQ.save();

              //clone answer
              const answers = await this.answerRepository.find({
                question: question,
              });
              for (const answer of answers) {
                await this.answerRepository.insert({
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                  question: newQ,
                });
              }
            }
          }
        }
      }
      return await curriculum.save();
    } catch (error) {
      throw error;
    }
  }
  async clone(
    user: User,
    createCurriculumDto: CreateCurriculumDto,
  ): Promise<Curriculum> {
    try {
      const { name, gradeId, classId, parentId } = createCurriculumDto;
      const curriculum = new Curriculum();
      curriculum.name = name;
      curriculum.createdBy = user.id;

      const grade = await this.gradeRepository.findOne(gradeId);
      if (!grade) {
        throw new NotFoundException('Grade not found');
      }
      curriculum.gradeId = gradeId;

      const classById = await this.classesRepository.findOne(classId);
      if (!classById) {
        throw new NotFoundException('Class not found');
      }
      if (classById.gradeId !== gradeId) {
        throw new NotFoundException('Class not in selected grade');
      }
      curriculum.classId = classId;

      const curriculumById = await this.curriculumRepository.findOne(parentId);
      if (!curriculumById) {
        throw new NotFoundException('Curriculum not found');
      }
      curriculum.parentId = parentId;
      const curri = await curriculum.save();
      const lessons = await this.lessonRepository
        .createQueryBuilder()
        .where('curriculum_id = :curriculumId', {
          curriculumId: curriculumById.id,
        })
        .getMany();
      //clone curriculum's lessons
      for (const lesson of lessons) {
        const ls = new Lesson();
        ls.name = lesson.name;
        ls.position = lesson.position;
        ls.curriculumId = curri.id;
        await ls.save();
        //clone lesson's material
        const lessonMaterials = await this.lessonMaterialRepository
          .createQueryBuilder()
          .where('lesson_id = :lessonId', { lessonId: lesson.id })
          .getMany();
        for (const lessonMaterial of lessonMaterials) {
          await this.lessonMaterialRepository.insert({
            displayName: lessonMaterial.displayName,
            url: lessonMaterial.url,
            uploaderId: lessonMaterial.uploaderId,
            lessonId: ls.id,
          });
        }
        //clone lectures
        const lessonLectures = await this.lessonLectureRepository
          .createQueryBuilder()
          .where('lesson_id = :lessonId', { lessonId: lesson.id })
          .getMany();
        for (const ll of lessonLectures) {
          //clone lecture
          const lecture = await this.lectureRepository.findOne(ll.lectureId);
          const newLec = new Lecture();
          newLec.name = lecture.name;
          newLec.ownerId = user.id;
          await newLec.save();
          await this.lessonLectureRepository.insert({
            lessonId: ls.id,
            lectureId: newLec.id,
          });

          //clone lecture's question
          const questions = await this.questionRepository.find({
            lectureId: lecture.id,
          });
          for (const question of questions) {
            const newQ = new Question();
            newQ.lectureId = newLec.id;
            newQ.question = question.question;
            newQ.imageUrl = question.imageUrl;
            newQ.duration = question.duration;
            await newQ.save();

            //clone answer
            const answers = await this.answerRepository.find({
              question: question,
            });
            for (const answer of answers) {
              await this.answerRepository.insert({
                content: answer.content,
                isCorrect: answer.isCorrect,
                question: newQ,
              });
            }
          }
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
      const curri = await this.curriculumRepository.findOne(
        createLessonDto.curriculumId,
      );
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      const newLesson = new Lesson();
      newLesson.curriculumId = createLessonDto.curriculumId;
      newLesson.name = createLessonDto.name;
      //get max position value
      const lessonNumber = await this.lessonRepository
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

  async findAll(
    options: IPaginationOptions,
    filter: CurriculumFilter,
    user: User,
  ) {
    try {
      // let rawPagination;
      // if (user.role == Role.Administrator || user.role == Role.Teacher) {
      //   rawPagination = await paginate(this.curriculumRepo, options, {
      //     where: filter,
      //   });
      // } else if (user.role == Role.Teacher) {
      //   const query = await this.curriculumRepo
      //     .createQueryBuilder()
      //     .where('created_by = :id', { id: user.id })
      //     .orWhere('parent_id IS NULL');
      //   rawPagination = await paginate(query, options);
      // }
      //  else if (user.role == Role.Teacher) {
      //   const userClasses = await this.userClassRepo.find({
      //     teacherId: user.id,
      //   });
      //   const classIds = [];
      //   for (const uc of userClasses) {
      //     classIds.push(uc.classId);
      //   }
      //   const adminIds = [];
      //   const admins = await this.userRepo.find({ role: Role.Administrator });
      //   for (const admin of admins) {
      //     adminIds.push(admin.id);
      //   }
      //   const query = await this.curriculumRepo
      //     .createQueryBuilder()
      //     .where('class_id IN (:...ids)', { ids: classIds })
      //     .orWhere('created_by IN (:...ids)', { ids: adminIds });
      //   rawPagination = await paginate(query, options);
      // }
      // else {
      //   const userClasses = await this.userClassRepo.find({
      //     studentId: user.id,
      //   });
      //   const classIds = [];
      //   for (const uc of userClasses) {
      //     classIds.push(uc.classId);
      //   }
      //   const query = await this.curriculumRepo
      //     .createQueryBuilder()
      //     .where('class_id IN (:...ids)', { ids: classIds });
      //   rawPagination = await paginate(query, options);
      // }
      // for (const curri of rawPagination.items) {
      //   const createrName = (
      //     await this.userRepo
      //       .createQueryBuilder('u')
      //       .select('u.fullName')
      //       .where('u.id = :id', { id: curri.createdBy })
      //       .getOne()
      //   ).fullName;
      //   const className = (await this.classRepo.findOne(curri.classId)).name;
      //   Object.assign(curri, {
      //     creatorName: createrName,
      //     className: className,
      //   });
      // }
      // return rawPagination;
      const query = this.curriculumRepository.createQueryBuilder();
      const classes = [];
      const grades = await this.gradeRepository.find();
      const classesBySyId = [];
      if (filter.schoolYearId) {
        const classes = await this.classesRepository.find({
          schoolYearId: filter.schoolYearId,
        });
        for (const c of classes) {
          classesBySyId.push(c.id);
        }
        if (classesBySyId.length == 0) {
          return [];
        }
      }
      if (user.role == Role.Administrator) {
        //check if user is a Admin
        classes.push(await this.classesRepository.find());
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :classId', { classId: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :gradeId', { id: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.schoolYearId) {
          query.andWhere('class_id IN (:...classBySyIds)', {
            classBySyIds: classesBySyId,
          });
        }
      }
      //check if user is a student
      if (user.role == Role.Student) {
        const classIds = [];
        //find user's class
        const userClasses = await this.userClassRepository.find({
          studentId: user.id,
        });
        //push user class to array
        for (const uc of userClasses) {
          const classById = await this.classesRepository.findOne(uc.classId);
          classes.push(classById);
          classIds.push(classById.id);
        }
        query.where('class_id IN (:...ids)', { ids: classIds });
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :classId', { classId: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :gradeId', { gradeId: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.schoolYearId) {
          query.andWhere('class_id IN (:...classBySyIds)', {
            classBySyIds: classesBySyId,
          });
        }
      }
      //check if user is a Teacher
      if (user.role == Role.Teacher) {
        const classIds = [];
        //find user's class
        const userClasses = await this.userClassRepository.find({
          teacherId: user.id,
        });
        //push user class to array
        for (const uc of userClasses) {
          const classById = await this.classesRepository.findOne(uc.classId);
          classes.push(classById);
          classIds.push(classById.id);
        }
        const adminIds = [];
        //push admin ids to array
        const admins = await this.userRepository.find({
          role: Role.Administrator,
        });
        for (const admin of admins) {
          adminIds.push(admin.id);
        }
        //check if only get sample curriculum
        if (filter.sample == 1) {
          query.where('created_by IN (:...adminIds)', { adminIds: adminIds });
        } else if (filter.sample == 0) {
          query.where('class_id IN (:...classIds)', { classIds: classIds });
        } else {
          query.where(
            new Brackets((qb) => {
              qb.where('class_id IN (:...classIds)', {
                classIds: classIds,
              }).orWhere('created_by IN (:...adminIds)', {
                adminIds: adminIds,
              });
            }),
          );
        }
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :classId', { classId: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :gradeId', { gradeId: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.schoolYearId) {
          query.andWhere('class_id IN (:...classBySyIds)', {
            classBySyIds: classesBySyId,
          });
        }
      }
      //get paginate curriculum
      const rawPaginate = await paginate<Curriculum>(query, options);
      Object.assign(rawPaginate, { grades: grades, classes: classes });
      for (const curri of rawPaginate.items) {
        const createrName = (
          await this.userRepository
            .createQueryBuilder('u')
            .select('u.fullName')
            .where('u.id = :id', { id: curri.createdBy })
            .getOne()
        ).fullName;
        const className = (await this.classesRepository.findOne(curri.classId))
          .name;
        Object.assign(curri, {
          creatorName: createrName,
          className: className,
        });
      }
      return rawPaginate;
    } catch (error) {
      throw error;
    }
  }

  async findAllLessonByCurriculumId(id: number): Promise<Lesson[]> {
    try {
      const data = await this.curriculumRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Curriculum not exist');
      }
      const lessons = await this.lessonRepository
        .createQueryBuilder()
        .where('curriculum_id = :id', { id: id })
        .orderBy('position', 'ASC')
        .getMany();
      for (const lesson of lessons) {
        const lessonMaterials = await this.lessonMaterialRepository.find({
          lessonId: lesson.id,
        });
        const lessonLecture = await this.lessonLectureRepository.find({
          lessonId: lesson.id,
        });
        const lectures = [];
        await Promise.all(
          lessonLecture.map(async (ll: LessonLecture) => {
            lectures.push(await this.lectureRepository.findOne(ll.lectureId));
          }),
        );
        lectures.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
        Object.assign(lesson, {
          lessonMaterials: lessonMaterials,
          lectures: lectures,
        });
      }
      return lessons;
    } catch (error) {
      throw error;
    }
  }

  async swapLessonPosition(id1: number, id2: number) {
    try {
      const data1 = await this.lessonRepository.findOne(id1);
      if (!data1) {
        throw new NotFoundException(`Lesson with id ${id1} not exist`);
      }
      const data2 = await this.lessonRepository.findOne(id2);
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
      const data = await this.curriculumRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Curriculum not exist');
      }
      const classById = await this.classesRepository.findOne(data.classId);
      const createrName = await this.userRepository
        .createQueryBuilder('u')
        .select('u.fullName')
        .where('u.id = :id', { id: data.createdBy })
        .getOne();
      Object.assign(data, {
        creatorName: createrName['fullName'],
        className: classById.name,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }

  async findOneLesson(id: number): Promise<Lesson> {
    try {
      const data = await this.lessonRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Lesson not exist');
      }
      const lessonMaterials = await this.lessonMaterialRepository.find({
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
      const curri = await this.curriculumRepository.findOne(id);
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      if (gradeId) {
        //check grade id
        const grade = await this.gradeRepository.findOne(gradeId);
        if (!grade) {
          throw new NotFoundException('Grade not found');
        }
      }
      //check class id
      if (classId) {
        const classById = await this.classesRepository.findOne(classId);
        if (!classById) {
          throw new NotFoundException('Class not found');
        }
        if (classById.gradeId !== gradeId) {
          throw new NotFoundException('Class not in selected grade');
        }
      }
      //check parent id, if curriculum does not have parent id means its a template
      if (parentId) {
        const curriculumById = await this.curriculumRepository.findOne(
          parentId,
        );
        if (!curriculumById) {
          throw new NotFoundException('Parent curriculum not found');
        }
      }
      if (parentId == id) {
        throw new BadRequestException('Can not clone itself');
      }
      await this.curriculumRepository.update(id, updateCurriculumDto);
      return await this.curriculumRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async updateLesson(
    id: number,
    updateLessonDto: UpdateLesssonDto,
  ): Promise<Lesson> {
    try {
      const data = await this.lessonRepository.findOne(id);
      if (!data) {
        throw new NotFoundException('Lesson not exist');
      }
      await this.lessonRepository.update(id, updateLessonDto);
      return await this.lessonRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      //check curriculum
      const curri = await this.curriculumRepository.findOne(id);
      if (!curri) {
        throw new NotFoundException('Curriculum not found');
      }
      const lessons = await this.lessonRepository
        .createQueryBuilder()
        .where('curriculum_id = :id', { id: curri.id })
        .getMany();
      for (const lesson of lessons) {
        await this.lessonMaterialRepository
          .createQueryBuilder()
          .delete()
          .where('lesson_id = :id', { id: lesson.id })
          .execute();
      }
      await this.curriculumRepository.delete(id);
      await this.lessonRepository
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
      const lesson = await this.lessonRepository.findOne(id);
      if (!lesson) {
        throw new NotFoundException('Lesson not found');
      }
      await this.lessonMaterialRepository
        .createQueryBuilder()
        .delete()
        .where('lesson_id = :id', { id: lesson.id })
        .execute();
      await this.lessonRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async getFilteredCurriculum(
    user: User,
    filter: {
      includeSample: boolean;
      limit: number;
      page: number;
      schoolYearId: number;
      gradeId: number;
      classId: number;
      curriculumName: string;
      dateFrom: Date;
      dateTo: Date;
    },
  ) {
    let queryBuilder = await this.curriculumRepository
      .createQueryBuilder('c')
      .leftJoin(Grade, 'g', 'c.grade_id = g.id')
      .leftJoin(User, 'u', 'c.created_by = u.id')
      .leftJoin(Classes, 'cl', 'cl.id = c.class_id')
      .select('c.id', 'id')
      .addSelect('c.name', 'name')
      .addSelect('g.id', 'gradeId')
      .addSelect('g.name', 'gradeName')
      .addSelect('cl.id', 'classId')
      .addSelect('cl.name', 'className')
      .addSelect('u.id', 'userId')
      .addSelect('u.full_name', 'creatorName')
      .addSelect('c.created_at', 'createdAt');

    //Include Sample
    const creatorsIds = [];
    if (filter.includeSample) {
      const admins = await this.userRepository.find({
        where: { role: Role.Administrator },
      });

      for (const a of admins) {
        creatorsIds.push(a.id);
      }
    }

    //Role
    // queryBuilder =
    //   user.role == Role.Teacher
    //     ? queryBuilder.andWhere('c.created_by IN(:creatorsIds)', {
    //         creatorsIds: creatorsIds.toString(),
    //       })
    //     : queryBuilder;

    //School Year
    queryBuilder = filter.schoolYearId
      ? queryBuilder
          .innerJoin(SchoolYear, 's', 'cl.school_year_id = s.id')
          .andWhere('s.id =:schoolYearId', {
            schoolYearId: filter.schoolYearId,
          })
      : queryBuilder;

    //Grade
    queryBuilder = filter.gradeId
      ? queryBuilder.andWhere('c.grade_id =:gradeId', {
          gradeId: filter.gradeId,
        })
      : queryBuilder;

    const classesIds = [];
    if (user.role != Role.Administrator) {
      const classes =
        user.role == Role.Teacher
          ? await this.userClassRepository.find({
              where: { teacherId: user.id },
            })
          : await this.userClassRepository.find({
              where: { studentId: user.id },
            });

      for (const cl of classes) {
        classesIds.push(cl.classId);
      }

      console.log('classes: ', classesIds);

      queryBuilder = queryBuilder.andWhere('c.class_id IN(:classesIds)', {
        classesIds: classesIds,
      });

      queryBuilder = filter.includeSample
        ? queryBuilder.orWhere('cl.id IS null')
        : queryBuilder;
    }

    //Classes
    queryBuilder = filter.classId
      ? queryBuilder.andWhere('c.class_id =:classId', {
          classId: filter.classId,
        })
      : queryBuilder;

    //Name
    queryBuilder = filter.curriculumName
      ? queryBuilder.andWhere('c.name LIKE :curriculumName', {
          curriculumName: '%' + filter.curriculumName + '%',
        })
      : queryBuilder;

    //Date From
    console.log(filter.dateFrom);

    queryBuilder = filter.dateFrom
      ? queryBuilder.andWhere('c.created_at > :dateFrom', {
          dateFrom: filter.dateFrom,
        })
      : queryBuilder;

    //Date To
    console.log(filter.dateTo);

    queryBuilder = filter.dateTo
      ? queryBuilder.andWhere('c.created_at < :dateTo', {
          dateTo: filter.dateTo,
        })
      : queryBuilder;

    const paginatedRaw = paginateRaw(queryBuilder, {
      limit: filter.limit ?? PaginationEnum.DefaultLimit,
      page: filter.page ?? PaginationEnum.DefaultPage,
    });

    return paginatedRaw;
  }

  async getCurriculumIdByLectureId(lectureId: number): Promise<number> {
    try {
      const lecture = await this.lectureRepository.findOne(lectureId);
      if (!lecture) {
        throw new NotFoundException('Lecture not exist');
      }
      const curriculum = await this.curriculumRepository
        .createQueryBuilder('c')
        .innerJoin(Lesson, 'l', 'l.curriculum_id = c.id')
        .innerJoin(LessonLecture, 'll', 'll.lesson_id = l.id')
        .where('ll.lecture_id = :lectureId', { lectureId: lectureId })
        .getOne();
      return curriculum.id;
    } catch (error) {
      throw error;
    }
  }
}
