import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IsNull, Not } from 'typeorm';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserRepository } from '../user/repository/user.repository';
import { AssignClassToTeacherDto } from './dto/assign-class-teacher.dto';
import { AssignStudentsClassDto } from './dto/assign-student-class.dto';
import { AssignTeachersClassDto } from './dto/assign-teacher-class.dto';
import { ChangeStudentsClass } from './dto/change-student-class.dto';
import { UserClassRepository } from './repository/question.repository';

@Injectable()
export class UserClassService {
  constructor(
    private userClassReposiory: UserClassRepository,
    private userRepository: UserRepository,
    private classRepository: ClassesRepository,
  ) {}

  async assignStudentsToClass(assignStudentClass: AssignStudentsClassDto) {
    const classId = assignStudentClass.classId;
    if (!(await this.classRepository.findOne(classId))) {
      throw new BadRequestException('Class id not exist');
    }
    const assignedStudents = [];
    const alreadyAssignedStudents = [];
    const unassignedStudents = [];
    for (const studentId of assignStudentClass.studentIds) {
      const student = await this.userRepository.findOne(studentId, {
        select: ['id', 'username', 'fullName'],
      });
      if (student) {
        if (
          await this.userClassReposiory.findOne({
            where: { studentId: studentId, classId: classId },
          })
        ) {
          alreadyAssignedStudents.push(student);
        } else {
          await this.userClassReposiory.insert({
            studentId: studentId,
            classId: classId,
          });
          assignedStudents.push(student);
        }
      } else {
        unassignedStudents.push({ id: studentId });
      }
    }
    return {
      assignedStudents: assignedStudents,
      alreadyAssignedStudents: alreadyAssignedStudents,
      unassignedStudents: unassignedStudents,
    };
  }

  async assignTeachersToClass(assignTeacherClass: AssignTeachersClassDto) {
    const classId = assignTeacherClass.classId;
    if (!(await this.classRepository.findOne(classId))) {
      throw new BadRequestException('Class id not exist');
    }
    const assignedTeachers = [];
    const alreadyAssignedTeachers = [];
    const unassignedTeachers = [];
    for (const teacherId of assignTeacherClass.teacherIds) {
      const teacher = await this.userRepository.findOne(teacherId, {
        select: ['id', 'username', 'fullName'],
      });
      if (teacher) {
        if (
          await this.userClassReposiory.findOne({
            where: { teacherId: teacherId, classId: classId },
          })
        ) {
          alreadyAssignedTeachers.push(teacher);
        } else {
          await this.userClassReposiory.insert({
            teacherId: teacherId,
            classId: classId,
          });
          assignedTeachers.push(teacher);
        }
      } else {
        unassignedTeachers.push({ id: teacherId });
      }
    }
    return {
      assignedTeachers: assignedTeachers,
      alreadyAssignedTeachers: alreadyAssignedTeachers,
      unassignedTeachers: unassignedTeachers,
    };
  }
  async assignClassesToTeacher(
    assignClassesToTeacher: AssignClassToTeacherDto,
  ) {
    console.log('called');
    try {
      const { classIds, teacherId } = assignClassesToTeacher;
      for (const id of classIds) {
        if (!(await this.classRepository.findOne(id))) {
          throw new NotFoundException(`Class with ${id} not exist`);
        }
      }
      const teacher = await this.userRepository.findOne(teacherId, {
        select: ['id', 'username', 'fullName'],
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not exist');
      }
      await this.userClassReposiory
        .createQueryBuilder()
        .where('teacher_id = :teacherId', { teacherId: teacher.id })
        .delete()
        .execute();
      for (const id of classIds) {
        await this.userClassReposiory.insert({
          classId: id,
          teacherId: teacher.id,
        });
      }
    } catch (error) {
      throw error;
    }
  }
  async changeStudentClass(changeStudentClass: ChangeStudentsClass) {
    try {
      const { newClassId, studentIds, oldClassId } = changeStudentClass;
      const newClass = await this.classRepository.findOne(newClassId);
      if (!newClass) {
        throw new NotFoundException(`Class with id ${newClassId} not exist`);
      }
      const oldClass = await this.classRepository.findOne(oldClassId);
      if (!oldClass) {
        throw new NotFoundException(`Class with id ${oldClassId} not exist`);
      }
      for (const id of studentIds) {
        const user = await this.userRepository.findOne(id);
        if (!user) {
          throw new NotFoundException(`Student with id ${id} not exist`);
        }
        const newUserCLass = await this.userClassReposiory
          .createQueryBuilder()
          .where('student_id = :studentId', { studentId: id })
          .andWhere('class_id = :classId', { classId: newClassId })
          .getOne();
        if (newUserCLass) {
          throw new BadRequestException(
            `Student with id ${id} already in new class`,
          );
        }
        const oldUserCLass = await this.userClassReposiory
          .createQueryBuilder()
          .where('student_id = :studentId', { studentId: id })
          .andWhere('class_id = :classId', { classId: oldClassId })
          .getOne();
        if (!oldUserCLass) {
          throw new BadRequestException(
            `Student with id ${id} not in old class`,
          );
        }
      }
      for (const id of studentIds) {
        await this.userClassReposiory
          .createQueryBuilder()
          .delete()
          .where('student_id = :studentId', { studentId: id })
          .andWhere('class_id = :classId', { classId: oldClassId })
          .execute();
        await this.userClassReposiory.insert({
          studentId: id,
          classId: newClassId,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async assignToHigherGrade(
    oldClassId: number,
    newClassId: number,
    studentIds: number[],
  ) {
    try {
      const newClass = await this.classRepository.findOne(newClassId);
      if (!newClass) {
        throw new NotFoundException(`Class with id ${newClassId} not exist`);
      }
      const oldClass = await this.classRepository.findOne(oldClassId);
      if (!oldClass) {
        throw new NotFoundException(`Class with id ${oldClassId} not exist`);
      }
      for (const sid of studentIds) {
        const userClass = await this.userClassReposiory.find({
          studentId: sid,
          classId: oldClassId,
        });
        if (!userClass) {
          throw new NotFoundException(
            `Student with id ${sid} is not in class with id ${oldClassId}`,
          );
        }
      }
      for (const sid of studentIds) {
        const userClass = await this.userClassReposiory.findOne({
          studentId: sid,
          classId: newClassId,
        });
        if (userClass) {
          throw new NotFoundException(
            `Student with id ${sid} is already in class with id ${newClassId}`,
          );
        }
      }
      for (const sid of studentIds) {
        await this.userClassReposiory.insert({
          classId: newClassId,
          studentId: sid,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
