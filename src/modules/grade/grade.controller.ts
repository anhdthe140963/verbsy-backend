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
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { GradeService } from './grade.service';

@Controller('grade')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
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
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator)
  async findAll(): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get all grade successfully',
      data: await this.gradeService.findAll(),
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
      message: 'Get get grade successfully',
      data: await this.gradeService.findOne(id),
    };
  }

  @Put(':id')
  @UseGuards(AuthGuard(), RolesGuard)
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
  @UseGuards(AuthGuard(), RolesGuard)
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
