import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AssignClassToTeacherDto } from './dto/assign-class-teacher.dto';
import { AssignStudentsClassDto } from './dto/assign-student-class.dto';
import { AssignTeachersClassDto } from './dto/assign-teacher-class.dto';
import { ChangeStudentsClass } from './dto/change-student-class.dto';
import { UserClassService } from './user-class.service';
@UseGuards(AuthGuard(), RolesGuard)
@Controller('user-class')
export class UserClassController {
  constructor(private readonly userClassService: UserClassService) {}

  @Roles(Role.Administrator)
  @Post('assign-students-to-class')
  async assignStudentsToClass(
    @Body() assignStudentClass: AssignStudentsClassDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Students assigned to class',
      data: await this.userClassService.assignStudentsToClass(
        assignStudentClass,
      ),
    };
  }

  @Roles(Role.Administrator)
  @Post('assign-teachers-to-class')
  async assignTeachersToClass(
    @Body() assignTeachersToClassDto: AssignTeachersClassDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Teachers assigned to class',
      data: await this.userClassService.assignTeachersToClass(
        assignTeachersToClassDto,
      ),
    };
  }

  @Roles(Role.Administrator)
  @Post('assign-classes-to-teacher')
  async assignClassToTeacher(
    @Body() assignClassToTeacherDto: AssignClassToTeacherDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Classes assigned to teacher',
      data: await this.userClassService.assignClassesToTeacher(
        assignClassToTeacherDto,
      ),
    };
  }

  @Roles(Role.Administrator)
  @Post('change-students-class')
  async changeStudentsClass(
    @Body() changeStudentClass: ChangeStudentsClass,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Student class change',
      data: await this.userClassService.changeStudentClass(changeStudentClass),
    };
  }
  @Roles(Role.Administrator)
  @Post('assign-higher-grade')
  async assignHigherGrade(
    @Body() assignDto: { oldClassId: number; newClassId: number },
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Class changed',
      data: await this.userClassService.assignToHigherGrade(
        assignDto.oldClassId,
        assignDto.newClassId,
      ),
    };
  }
}
