import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { GetUser } from 'src/decorator/get-user-decorator';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeService } from './grade.service';

@UseGuards(AuthGuard(), RolesGuard)
@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @Roles(Role.Administrator)
  async create(
    @Body() createGradeDto: CreateGradeDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Grade Created',
      data: await this.gradeService.create(createGradeDto),
    };
  }

  @Get()
  @Roles(Role.Administrator, Role.Teacher)
  async findAll(
    @GetUser() user,
    @Query('schoolYearId') schoolYearId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get grade successfully',
      data: await this.gradeService.getGradesForUser(user, schoolYearId),
    };
  }

  @Get(':id')
  @Roles(Role.Administrator)
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get get grade successfully',
      data: await this.gradeService.findOne(id),
    };
  }

  @Put(':id')
  @Roles(Role.Administrator)
  async update(
    @Param('id') id: number,
    @Body() updateGradeDto: UpdateGradeDto,
  ): Promise<{ statusCode; error; message }> {
    await this.gradeService.update(id, updateGradeDto);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Grade updated',
    };
  }

  @Delete(':id')
  @Roles(Role.Administrator)
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message }> {
    await this.gradeService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Grade deleted',
    };
  }
}
