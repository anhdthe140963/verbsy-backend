import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { Brackets, Repository } from 'typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { Grade } from '../grade/entities/grade.entity';
import { Lecture } from '../lecture/entity/lecture.entity';
import { LectureRepository } from '../lecture/repository/lecture.repository';
import { LessonLecture } from '../lesson-lecture/entities/lesson-lecture.entity';
import { LessonMaterialRepository } from '../lesson-material/repository/lesson-material.repository';
import { Answer } from '../question/entity/answer.entity';
import { Question } from '../question/entity/question.entity';
import { QuestionRepository } from '../question/repository/question.repository';
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
    @InjectRepository(LessonLecture)
    private lessonLectureRepo: Repository<LessonLecture>,
    private lectureRepo: LectureRepository,
    private userClassRepo: UserClassRepository,
    private questionRepo: QuestionRepository,
    @InjectRepository(Answer)
    private answerRepo: Repository<Answer>,
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
          .where('curriculum_id = :id', { id: curriculumById.id })
          .getMany();
        console.log(lessons);

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
          for (const lessonMaterial of lessonMaterials) {
            await this.lessonMaterialRepo.insert({
              displayName: lessonMaterial.displayName,
              url: lessonMaterial.url,
              uploaderId: lessonMaterial.uploaderId,
              lessonId: ls.id,
            });
          }
          //clone lectures
          const lessonLectures = await this.lessonLectureRepo
            .createQueryBuilder()
            .where('lesson_id = :id', { id: lesson.id })
            .getMany();
          for (const ll of lessonLectures) {
            //clone lecture
            const lecture = await this.lectureRepo.findOne(ll.lectureId);
            const newLec = new Lecture();
            newLec.name = lecture.name;
            newLec.content = lecture.content;
            newLec.ownerId = user.id;
            await newLec.save();
            await this.lessonLectureRepo.insert({
              lessonId: ls.id,
              lectureId: newLec.id,
            });

            //clone lecture's question
            const questions = await this.questionRepo.find({
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
              const answers = await this.answerRepo.find({
                question: question,
              });
              for (const answer of answers) {
                await this.answerRepo.insert({
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
      const query = this.curriculumRepo.createQueryBuilder();
      const classes = [];
      const grades = await this.gradeRepo.find();
      //check if user is a Admin
      if (user.role == Role.Administrator) {
        classes.push(await this.classRepo.find());
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :id', { id: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :id', { id: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
      }
      //check if user is a student
      if (user.role == Role.Student) {
        const classIds = [];
        //find user's class
        const userClasses = await this.userClassRepo.find({
          studentId: user.id,
        });
        //push user class to array
        for (const uc of userClasses) {
          const classById = await this.classRepo.findOne(uc.classId);
          classes.push(classById);
          classIds.push(classById.id);
        }
        query.where('class_id IN (:...ids)', { ids: classIds });
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :id', { id: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :id', { id: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
      }
      //check if user is a Teacher
      if (user.role == Role.Teacher) {
        const classIds = [];
        //find user's class
        const userClasses = await this.userClassRepo.find({
          teacherId: user.id,
        });
        //push user class to array
        for (const uc of userClasses) {
          const classById = await this.classRepo.findOne(uc.classId);
          classes.push(classById);
          classIds.push(classById.id);
        }
        const adminIds = [];
        //push admin ids to array
        const admins = await this.userRepo.find({ role: Role.Administrator });
        for (const admin of admins) {
          adminIds.push(admin.id);
        }
        console.log(adminIds);
        console.log(classIds);
        query.where(
          new Brackets((qb) => {
            qb.where('class_id IN (:...ids)', { ids: classIds }).orWhere(
              'created_by IN (:...ids)',
              { ids: adminIds },
            );
          }),
        );
        //check if filter is inputed
        if (filter.classId) {
          query.andWhere('class_id = :id', { id: filter.classId });
        }
        if (filter.gradeId) {
          query.andWhere('grade_id = :id', { id: filter.gradeId });
        }
        if (filter.name) {
          query.andWhere('name LIKE :name', { name: `%${filter.name}%` });
        }
      }
      console.log(query.getQuery());
      //get paginate curriculum
      const rawPaginate = await paginate<Curriculum>(query, options);
      Object.assign(rawPaginate, { grades: grades, classes: classes });
      for (const curri of rawPaginate.items) {
        const createrName = (
          await this.userRepo
            .createQueryBuilder('u')
            .select('u.fullName')
            .where('u.id = :id', { id: curri.createdBy })
            .getOne()
        ).fullName;
        const className = (await this.classRepo.findOne(curri.classId)).name;
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
        const lessonLecture = await this.lessonLectureRepo.find({
          lessonId: lesson.id,
        });
        const lectures = [];
        await Promise.all(
          lessonLecture.map(async (ll: LessonLecture) => {
            lectures.push(await this.lectureRepo.findOne(ll.lectureId));
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
      const classById = await this.classRepo.findOne(data.classId);
      const createrName = await this.userRepo
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
