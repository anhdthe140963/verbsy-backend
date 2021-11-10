import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { LessonLectureService } from './lesson-lecture.service';
import { CreateLessonLectureDto } from './dto/create-lesson-lecture.dto';
import { UpdateLessonLectureDto } from './dto/update-lesson-lecture.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { AssignLectureLessonDto } from './dto/assign-lecture-to-lesson.dto';

@Controller('lesson-lecture')
export class LessonLectureController {
  constructor(private readonly lessonLectureService: LessonLectureService) {}

  @Post()
  create(@Body() createLessonLectureDto: CreateLessonLectureDto) {
    return this.lessonLectureService.create(createLessonLectureDto);
  }

  @Get()
  findAll() {
    return this.lessonLectureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonLectureService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLessonLectureDto: UpdateLessonLectureDto,
  ) {
    return this.lessonLectureService.update(+id, updateLessonLectureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonLectureService.remove(+id);
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  @Post('assign-lecture-to-lesson')
  async assignLectureToLesson(
    @Body() assignLectureToLessonDto: AssignLectureLessonDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Lectures assign to lesson',
      data: await this.lessonLectureService.assignLectureToLesson(
        assignLectureToLessonDto,
      ),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Administrator, Role.Teacher)
  @Post('unassign-lecture-to-lesson')
  async unAssignLectureToLesson(
    @Body() assignLectureToLessonDto: AssignLectureLessonDto,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Lectures unassign to lesson',
      data: await this.lessonLectureService.unAssignLectureToLesson(
        assignLectureToLessonDto,
      ),
    };
  }
}
