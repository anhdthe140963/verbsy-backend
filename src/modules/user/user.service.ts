import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Role } from 'src/constant/role.enum';
import { removeVietnameseTones } from 'src/utils/convertVie';
import { ImportTeacherDto } from './dto/import-teacher.dto';
import { GenerateAccountDto } from './dto/generate-account.dto';
import { GetUserDto } from './dto/get-user.dto';
import { User } from './entity/user.entity';
import { TeacherInfoRepository } from './repository/teacher-info.repostitory';
import { UserRepository } from './repository/user.repository';
import { GenerateAccountOption } from 'src/interfaces/generate-account-option.interface';
import moment from 'moment';
import { StudentInfoRepository } from './repository/student-info.repository';
import { ImportStudentDto } from './dto/import-student.dto';
import { StudentInfo } from './entity/student-info.entity';
import { UpdateStudentInfoDto } from './dto/update-student-info.dto';
import { UserPaginationFilter } from './dto/user-pagination.filter';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private teacherInfoRepository: TeacherInfoRepository,
    private studentInfoRepository: StudentInfoRepository,
  ) {}

  async getUserDetail(userId: number): Promise<GetUserDto> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not exist');
    }
    const getUserDto = new GetUserDto();
    getUserDto.username = user.username;
    getUserDto.fullName = user.fullName;
    getUserDto.email = user.email;
    getUserDto.phone = user.phone;
    getUserDto.id = user.id;
    getUserDto.role = user.role;
    getUserDto.avatar = user.avatar;
    return getUserDto;
  }

  async generateStudentAccount(
    genAccDto: GenerateAccountDto,
  ): Promise<Record<string, unknown>> {
    const { fullName } = genAccDto;
    let user = new User();
    user = await user.save();
    const nameParts = fullName.split(' ');
    let username = await this.removeAccents(nameParts.at(-1));
    nameParts.pop();
    await Promise.all(
      nameParts.map(async (element) => {
        element = await this.removeAccents(element);
        username = username + element.slice(0, 1);
      }),
    );
    // let username = firstName + lastName.slice(0, 1);
    // if (middleName) {
    //   username = username + middleName.slice(0, 1);
    // }
    // username = username + user.id;
    const randomPassword = Math.random().toString(36).slice(-8);

    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.userRepository.hashPassword(
      randomPassword,
      user.salt,
    );
    await user.save();
    return { username: username, password: randomPassword };
  }

  async getUserByFilter(
    options: IPaginationOptions,
    roleId: number,
  ): Promise<Pagination<User>> {
    try {
      return await paginate<User>(this.userRepository, options, {
        where: `role = ${roleId}`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async generateAccount(
    fullName: string,
    role: Role,
    options?: GenerateAccountOption,
  ) {
    const user = await new User().save();

    user.fullName = fullName;

    const nameWithoutTones = removeVietnameseTones(fullName);
    const nameSections = nameWithoutTones.split(' ');

    //part 1 = first name
    const usernamePart1 = nameSections[nameSections.length - 1];

    // part 2 = last name initial + middlename initials
    let usernamePart2 = '';
    if (nameSections.length > 1) {
      for (let i = 0; i < nameSections.length - 1; i++) {
        usernamePart2 += nameSections[i].charAt(0);
      }
    }

    //part 3 = role
    let usernamePart3 = '';
    switch (role) {
      case Role.Administrator:
        usernamePart3 = 'AD';
        user.role = Role.Administrator;
        break;
      case Role.Teacher:
        usernamePart3 = 'TE';
        user.role = Role.Teacher;
        break;
      case Role.Student:
        usernamePart3 = 'ST';
        user.role = Role.Student;
        break;
    }

    //part 4 = id
    const usernamePart4 = user.id;

    const username =
      usernamePart1 + usernamePart2 + usernamePart3 + usernamePart4;

    //shipper's password gen
    const randomPassword = Math.random().toString(36).slice(-8);

    //insert into db
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.userRepository.hashPassword(
      randomPassword,
      user.salt,
    );

    //apply options
    for (const prop in options) {
      user[prop] =
        prop != 'dob'
          ? options[prop]
          : moment(options.dob, 'DD/MM/yyyy').toDate();
    }

    await user.save();
    return user;
  }

  async importTeachers(teachers: ImportTeacherDto[]) {
    const duplicatedTeachers: ImportTeacherDto[] = [];
    const addedTeachers: ImportTeacherDto[] = [];
    for (const teacher of teachers) {
      const duplicatedTeacher = await this.teacherInfoRepository.findOne({
        where: { teacherCode: teacher.teacherCode },
      });

      if (duplicatedTeacher) {
        duplicatedTeachers.push(teacher);
      } else {
        try {
          const user = await this.generateAccount(
            teacher.fullName,
            Role.Teacher,
            { dob: teacher.dob, gender: teacher.gender, phone: teacher.phone },
          );

          await this.teacherInfoRepository.insert(
            Object.assign(teacher, { userId: user.id }),
          );

          addedTeachers.push(teacher);
        } catch (error) {
          console.log(error);

          throw new InternalServerErrorException('Error during insertion');
        }
      }
    }

    return {
      addedTeachers: addedTeachers,
      duplicatedTeachers: duplicatedTeachers,
    };
  }

  async importStudents(students: ImportStudentDto[]) {
    const duplicatedStudents: ImportStudentDto[] = [];
    const addedStudents: ImportStudentDto[] = [];
    for (const student of students) {
      const duplicatedStudent = await this.studentInfoRepository.findOne({
        where: { studentCode: student.studentCode },
      });

      if (duplicatedStudent) {
        duplicatedStudents.push(student);
      } else {
        try {
          const user = await this.generateAccount(
            student.fullName,
            Role.Student,
            { dob: student.dob, gender: student.gender, phone: student.phone },
          );

          await this.studentInfoRepository.insert(
            Object.assign(student, { userId: user.id }),
          );

          addedStudents.push(student);
        } catch (error) {
          console.log(error);

          throw new InternalServerErrorException('Error during insertion');
        }
      }
    }

    return {
      addedStudents: addedStudents,
      duplicatedStudents: duplicatedStudents,
    };
  }

  async getStudentInfoByUserId(userId: number): Promise<StudentInfo> {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not exist');
      }
      if (user.role !== Role.Student) {
        throw new BadRequestException('User is not a student');
      }
      return await this.studentInfoRepository
        .createQueryBuilder()
        .where('user_id = :userId', { userId: userId })
        .getOne();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateStudentInfoByUserId(
    userId: number,
    updateStudentInfoDto: UpdateStudentInfoDto,
  ) {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not exist');
      }
      if (user.role !== Role.Student) {
        throw new BadRequestException('User is not a student');
      }
      await this.studentInfoRepository.update(
        { userId: userId },
        updateStudentInfoDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getStudentInfoList(
    options: IPaginationOptions,
  ): Promise<Pagination<StudentInfo>> {
    return await paginate<StudentInfo>(this.studentInfoRepository, options);
  }

  async removeAccents(str): Promise<string> {
    return await str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  async getUserProfile(id: number) {
    let result = null;
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new BadRequestException('User not exist');
    }

    switch (user.role) {
      case Role.Teacher:
        const teacherInfo = await this.teacherInfoRepository.findOne({
          where: { userId: id },
        });
        result = Object.assign(user, { teacherInfo: teacherInfo });
        break;
      case Role.Student:
        const studentInfo = await this.studentInfoRepository.findOne({
          where: { userId: id },
        });
        result = Object.assign(user, { studentInfo: studentInfo });
        break;
      default:
        break;
    }

    return result ? result : { user: user };
  }

  async deleteUserProfile(id: number) {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new BadRequestException('User not exist');
    }

    switch (user.role) {
      case Role.Teacher:
        if (
          await this.teacherInfoRepository.findOne({ where: { userId: id } })
        ) {
          await this.teacherInfoRepository.delete({ userId: id });
        }
        break;
      case Role.Student:
        if (
          await this.studentInfoRepository.findOne({ where: { userId: id } })
        ) {
          await this.studentInfoRepository.delete({
            userId: id,
          });
        }
        break;
      default:
        break;
    }

    return await this.userRepository.delete({ id: id });
  }

  async getUserProfiles(
    options: IPaginationOptions,
    filter: UserPaginationFilter,
  ) {
    const pagination = await paginate(this.userRepository, options, {
      where: filter,
    });
    const transformedPagination = pagination;
    const role = filter.role ?? 0;
    switch (role) {
      case Role.Teacher:
        for (let item of transformedPagination.items) {
          const teacherInfo = await this.teacherInfoRepository.findOne({
            userId: item.id,
          });
          item = Object.assign(item, { teacherInfo: teacherInfo });
        }
        break;
      case Role.Student:
        for (let item of transformedPagination.items) {
          const studentInfo = await this.studentInfoRepository.findOne({
            userId: item.id,
          });
          item = Object.assign(item, { studentInfo: studentInfo });
        }
        break;
    }

    return transformedPagination;
  }
}
