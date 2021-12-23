import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { SchoolYearService } from './school-year.service';
@UseGuards(AuthGuard(), RolesGuard)
@Controller('school-year')
export class SchoolYearController {
  constructor(private readonly schoolYearService: SchoolYearService) {}

  @Post()
  @Roles(Role.Administrator)
  async create(
    @Body() createSchoolYearDto: CreateSchoolYearDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'School Year Created',
      data: await this.schoolYearService.create(createSchoolYearDto),
    };
  }

  @Get()
  @Roles(Role.Administrator, Role.Teacher, Role.Student)
  async findAll(): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get all school year successfully',
      data: await this.schoolYearService.findAll(),
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async findOne(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get school year successfully',
      data: await this.schoolYearService.findOne(id),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async update(
    @Param('id') id: number,
    @Body() updateSchoolYearDto: UpdateSchoolYearDto,
  ): Promise<{ statusCode; error; message }> {
    await this.schoolYearService.update(id, updateSchoolYearDto);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'School Year updated',
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async remove(
    @Param('id') id: number,
  ): Promise<{ statusCode; error; message }> {
    await this.schoolYearService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'School year deleted',
    };
  }

  @Put('change-status/:id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async changeSchoolYearStatus(
    @Param('id') id: number,
    @Body() status: { isActive: boolean },
  ): Promise<{ statusCode; error; message }> {
    await this.schoolYearService.changeStatus(id, status.isActive);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'School year status changed',
    };
  }

  @Put('set-active/:schoolYearId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async setActiveSchoolYear(@Param('schoolYearId') schoolYearId: number) {
    await this.schoolYearService.setActiveSchoolYear(schoolYearId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Active school year set',
    };
  }
}
