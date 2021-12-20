import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import moment from 'moment';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Default } from 'src/constant/default-pass.enum';
import { Role } from 'src/constant/role.enum';
import { GenerateAccountOption } from 'src/interfaces/generate-account-option.interface';
import { removeVietnameseTones } from 'src/utils/convertVie';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { ContractTypeRepository } from '../static-data/repositories/contract-type.repository';
import { EthnicRepository } from '../static-data/repositories/ethnic.repository';
import { QualificationRepository } from '../static-data/repositories/qualification.repository';
import { StudentStatusRepository } from '../static-data/repositories/student-status.repository';
import { SubjectRepository } from '../static-data/repositories/subject.repository';
import { TeacherStatusRepository } from '../static-data/repositories/teacher-status.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { GenerateAccountDto } from './dto/generate-account.dto';
import { GetUserDto } from './dto/get-user.dto';
import { ImportStudentDto } from './dto/import-student.dto';
import { ImportTeacherDto } from './dto/import-teacher.dto';
import { UpdateStudentInfoDto } from './dto/update-student-info.dto';
import { UpdateTeacherInfoDto } from './dto/update-teacher-info.dto';
import { updateUserDto } from './dto/update-user.dto';
import { UserPaginationFilter } from './dto/user-pagination.filter';
import { StudentInfo } from './entity/student-info.entity';
import { User } from './entity/user.entity';
import { StudentInfoRepository } from './repository/student-info.repository';
import { TeacherInfoRepository } from './repository/teacher-info.repostitory';
import { UserRepository } from './repository/user.repository';
@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private teacherInfoRepository: TeacherInfoRepository,
    private studentInfoRepository: StudentInfoRepository,
    private userClassRepository: UserClassRepository,
    private classesRepository: ClassesRepository,
    private readonly ethnicRepository: EthnicRepository,
    private readonly contractTypeRepository: ContractTypeRepository,
    private readonly qualificationRepository: QualificationRepository,
    private readonly studentStatusRepository: StudentStatusRepository,
    private readonly teacherStatusRepository: TeacherStatusRepository,
    private readonly subjectRepository: SubjectRepository,
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
    user.fullName = fullName;
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
    username = username + user.id;
    // let username = firstName + lastName.slice(0, 1);
    // if (middleName) {
    //   username = username + middleName.slice(0, 1);
    // }
    // username = username + user.id;
    const defaultPassword = Default.Password;

    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.userRepository.hashPassword(
      defaultPassword,
      user.salt,
    );
    await user.save();
    return { username: username, password: defaultPassword };
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

  async updateUser(userId: number, updateUserDto: updateUserDto) {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not exist');
      }
      await this.userRepository.update(userId, updateUserDto);
    } catch (error) {
      throw new Error(error);
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
    const defaultPassword = Default.Password;

    //insert into db
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.userRepository.hashPassword(
      defaultPassword,
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

  async createTeacher(
    createTeacherDto: CreateTeacherDto,
  ): Promise<CreateTeacherDto> {
    try {
      const data = await this.teacherInfoRepository.findOne({
        where: { teacherCode: createTeacherDto.teacherCode },
      });
      if (data) {
        throw new BadRequestException('Teacher already exist');
      }
      const user = await this.generateAccount(
        createTeacherDto.fullName,
        Role.Teacher,
        {
          dob: createTeacherDto.dob,
          gender: createTeacherDto.gender,
          phone: createTeacherDto.phone,
        },
      );

      await this.teacherInfoRepository.insert({
        userId: user.id,
        contractType: createTeacherDto.contractType,
        qualification: createTeacherDto.qualification,
        teacherCode: createTeacherDto.teacherCode,
        subject: createTeacherDto.teachingSubject,
      });
      return createTeacherDto;
    } catch (error) {
      throw error;
    }
  }

  async createStudent(
    classId: number,
    createStudentDto: CreateStudentDto,
  ): Promise<CreateStudentDto> {
    try {
      const data = await this.studentInfoRepository.findOne({
        where: { studentCode: createStudentDto.studentCode },
      });
      if (data) {
        throw new BadRequestException('Student already exist');
      }
      const classById = await this.classesRepository.findOne(classId);
      if (!classById) {
        throw new NotFoundException('Class not exist');
      }
      const user = await this.generateAccount(
        createStudentDto.fullName,
        Role.Student,
        {
          dob: createStudentDto.dob,
          gender: createStudentDto.gender,
          phone: createStudentDto.phone,
        },
      );

      await this.studentInfoRepository.insert({
        userId: user.id,
        ethnic: createStudentDto.ethnic,
        status: createStudentDto.status,
        studentCode: createStudentDto.studentCode,
      });
      await this.userClassRepository.insert({
        classId: classById.id,
        studentId: user.id,
      });
      return createStudentDto;
    } catch (error) {
      throw error;
    }
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

          const qualification = await this.qualificationRepository.findOne({
            where: { name: teacher.qualification },
          });

          const subject = await this.subjectRepository.findOne({
            where: { name: teacher.teachingSubject },
          });

          const contractType = await this.contractTypeRepository.findOne({
            where: { name: teacher.contractType },
          });

          await this.teacherInfoRepository.insert({
            userId: user.id,
            teacherCode: teacher.teacherCode,
            contractType: contractType ? contractType.id : null,
            qualification: qualification ? qualification.id : null,
            subject: subject ? subject.id : null,
          });

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

  async importStudents(students: ImportStudentDto[], classId: number) {
    if (!(await this.classesRepository.findOne(classId))) {
      throw new BadRequestException('Class not exist');
    }
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

          const ethnic = await this.ethnicRepository.findOne({
            where: { name: student.ethnic },
          });

          const status = await this.studentStatusRepository.findOne({
            where: { name: student.status },
          });

          await this.studentInfoRepository.insert({
            userId: user.id,
            ethnic: ethnic ? ethnic.id : null,
            status: status ? status.id : null,
            studentCode: student.studentCode,
          });

          if (
            !(await this.userClassRepository.findOne({
              where: {
                studentId: user.id,
                classId: classId,
              },
            }))
          ) {
            await this.userClassRepository.insert({
              studentId: user.id,
              classId: classId,
            });
          }

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

  async updateTeacherInfoByUserId(
    userId: number,
    updateTeacherInfoDto: UpdateTeacherInfoDto,
  ) {
    try {
      const user = await this.userRepository.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not exist');
      }
      if (user.role !== Role.Teacher) {
        throw new BadRequestException('User is not a teacher');
      }
      await this.teacherInfoRepository.update(
        { userId: userId },
        updateTeacherInfoDto,
      );
    } catch (error) {
      throw error;
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
