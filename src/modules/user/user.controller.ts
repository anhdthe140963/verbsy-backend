import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import excelStudentsFormat from 'excel-format/students.format.json';
import excelTeachersFormat from 'excel-format/teachers.format.json';
import { PaginationEnum } from 'src/constant/pagination.enum';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import fileExcelFilter from 'src/filter/file.excel.filter';
import { RolesGuard } from 'src/guards/roles.guard';
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
import { UserService } from './user.service';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post('student/generate-account')
  async generateStudentAccount(
    @Body() genAccDto: GenerateAccountDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Account created',
      data: await this.userService.generateStudentAccount(genAccDto),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('profile')
  async getUserProfiles(
    @Query() filter: UserPaginationFilter,
  ): Promise<{ statusCode; error; message; data }> {
    const userFilter: UserPaginationFilter = {};
    for (const prop in filter) {
      if (prop != 'page' && prop != 'limit') {
        userFilter[prop] = filter[prop];
      }
    }
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get user list successfully',
      data: await this.userService.getUserProfiles(
        {
          page: filter.page ? filter.page : PaginationEnum.DefaultPage,
          limit: filter.limit ? filter.limit : PaginationEnum.DefaultLimit,
        },
        userFilter,
      ),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  @Post('teacher')
  async createTeacher(
    @Body() createTeacherDto: CreateTeacherDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Teacher created',
      data: await this.userService.createTeacher(createTeacherDto),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  @Post('student/:classId')
  async createStudent(
    @Param('classId') classId: number,
    @Body() createStudentDto: CreateStudentDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Student created',
      data: await this.userService.createStudent(classId, createStudentDto),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Get(':userId')
  async getUserDetail(@Param('userId') userId: number): Promise<GetUserDto> {
    return await this.userService.getUserDetail(userId);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Post('import/teachers')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExcelFilter,
    }),
  )
  async importTeacherList(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excelToJson = require('convert-excel-to-json');
    const excel = excelToJson(
      Object.assign(
        {
          source: file.buffer,
        },
        excelTeachersFormat,
      ),
    );

    const teachers: ImportTeacherDto[] = [];

    //transform data
    try {
      const rawData: {
        teacherCode: string;
        fullName: string;
        dob: string;
        gender: string;
        phone: string;
        position: string;
        contractType: string;
        qualification: string;
        teachingSubject: string;
      }[] = excel['Sheet1'];

      for (const row of rawData) {
        if (row.position == 'Giáo viên' || row.position == 'Cán bộ quản lý') {
          const teacher: ImportTeacherDto = {
            teacherCode: row.teacherCode,
            fullName: row.fullName,
            dob: row.dob,
            gender: row.gender == 'Nam' ? true : false,
            phone: row.phone,
            contractType: row.contractType,
            qualification: row.qualification,
            teachingSubject: row.teachingSubject,
          };

          teachers.push(teacher);
        }
      }
    } catch (error) {
      throw new BadRequestException('Invalid Excel File Format');
    }

    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Teachers added succesfully',
      data: await this.userService.importTeachers(teachers),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Post('import/students/:classId')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExcelFilter,
    }),
  )
  async importStudentList(
    @UploadedFile() file: Express.Multer.File,
    @Param('classId') classId: number,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excelToJson = require('convert-excel-to-json');
    const excel = excelToJson(
      Object.assign(
        {
          source: file.buffer,
        },
        excelStudentsFormat,
      ),
    );

    const students: ImportStudentDto[] = [];

    //transform data
    try {
      const rawData: {
        studentCode: string;
        fullName: string;
        dob: string;
        gender: string;
        ethnic: string;
        status: string;
        phone: string;
      }[] = excel['Sheet1'];

      for (const row of rawData) {
        const student: ImportStudentDto = {
          studentCode: row.studentCode,
          fullName: row.fullName,
          dob: row.dob,
          gender: row.gender == 'Nam' ? true : false,
          ethnic: row.ethnic,
          status: row.status,
          phone: row.phone,
        };

        students.push(student);
      }
    } catch (error) {
      throw new BadRequestException('Invalid Excel File Format');
    }

    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Students added succesfully',
      data: await this.userService.importStudents(students, classId),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('student/student-info/:userId')
  async getStudentInfoByUserId(
    @Param('userId') userId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get student info successfully',
      data: await this.userService.getStudentInfoByUserId(userId),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put('student/student-info/:userId')
  async updateStudentInfoByUserId(
    @Param('userId') userId: number,
    @Body() updateStudentInfoDto: UpdateStudentInfoDto,
  ): Promise<{ statusCode; error; message }> {
    await this.userService.updateStudentInfoByUserId(
      userId,
      updateStudentInfoDto,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Update student info successfully',
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  @Put('teacher/teacher-info/:userId')
  async updateTeacherInfoByUserId(
    @Param('userId') userId: number,
    @Body() updateTeacherInfoDto: UpdateTeacherInfoDto,
  ): Promise<{ statusCode; error; message }> {
    await this.userService.updateTeacherInfoByUserId(
      userId,
      updateTeacherInfoDto,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Update teacher info successfully',
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':userId')
  async updateUserInfo(
    @Param('userId') userId: number,
    @Body() updateUserDto: updateUserDto,
  ): Promise<{ statusCode; error; message }> {
    await this.userService.updateUser(userId, updateUserDto);
    return { statusCode: HttpStatus.OK, error: null, message: 'User updated' };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('profile/:userId')
  async getUserProfile(
    @Param('userId') userId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get user info successfully',
      data: await this.userService.getUserProfile(userId),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Delete('profile/:userId')
  async deleteUserProfile(
    @Param('userId') userId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Deleted user successfully',
      data: await this.userService.deleteUserProfile(userId),
    };
  }
}
