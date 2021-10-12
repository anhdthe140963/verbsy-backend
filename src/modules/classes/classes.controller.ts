import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateResult } from 'typeorm';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-classes.dto';
import { UpdateClassDto } from './dto/update-classes.dto';
import { Classes } from './entity/classes.entity';

@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createClass(@Body() createClassDto: CreateClassDto): Promise<Classes> {
    return await this.classesService.createClasses(createClassDto);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':classId')
  async getQuestionDetail(@Param('classId') classId: number): Promise<Classes> {
    return await this.classesService.getClassesDetail(classId);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':classId')
  async updateQuestion(
    @Param('classId') classId: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<UpdateResult> {
    return await this.classesService.updateClass(classId, updateClassDto);
  }
}
