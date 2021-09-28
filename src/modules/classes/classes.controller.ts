import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-classes.dto';
import { UpdateClassDto } from './dto/update-classes.dto';
import { Classes } from './entity/classes.entity';

@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
  @Post()
  async createClass(@Body() createClassDto: CreateClassDto): Promise<Classes> {
    return await this.classesService.createClasses(createClassDto);
  }

  @Get(':classId')
  async getQuestionDetail(@Param('classId') classId: number): Promise<Classes> {
    return await this.classesService.getClassesDetail(classId);
  }

  @Put(':classId')
  async updateQuestion(
    @Param('classId') classId: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<UpdateResult> {
    return await this.classesService.updateClass(classId, updateClassDto);
  }
}
