import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserRepository } from '../user/repository/user.repository';
import { AssignClassToTeacherDto } from './dto/assign-class-teacher.dto';
import { AssignStudentsClassDto } from './dto/assign-student-class.dto';
import { AssignTeachersClassDto } from './dto/assign-teacher-class.dto';
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
      const assignedClasses = [];
      const alreadyAssignedClasses = [];
      for (const id of assignClassesToTeacher.classIds) {
        const userCLass = await this.userClassReposiory.findOne({
          teacherId: teacherId,
          classId: id,
        });
        if (userCLass) {
          alreadyAssignedClasses.push(id);
        } else {
          await this.userClassReposiory.insert({
            teacherId: teacherId,
            classId: id,
          });
          assignedClasses.push(id);
        }
      }
      return {
        assignedClasses: assignedClasses,
        alreadyAssignedClasses: alreadyAssignedClasses,
      };
    } catch (error) {
      throw error;
    }
  }
}
