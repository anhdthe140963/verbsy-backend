import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { AssignStudentsClassDto } from './dto/assign-student-class.dto';
import { UserClassService } from './user-class.service';

@Controller('user-class')
export class UserClassController {
  constructor(private readonly userClassService: UserClassService) {}

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
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
}
