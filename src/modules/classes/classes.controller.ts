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
import excelClassesFormat from 'excel-format/classes.format.json';
import { PaginationEnum } from 'src/constant/pagination.enum';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import fileExcelFilter from '../../filter/file.excel.filter';
import { ClassesService } from './classes.service';
import { addClassDto } from './dto/add-class.dto';
import { ClassFilter } from './dto/class.filter';
import { CreateClassDto } from './dto/create-classes.dto';
import { StudentFilter } from './dto/student.filter';
import { UpdateClassDto } from './dto/update-classes.dto';
@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Post()
  async createClass(
    @Body() createClassDto: CreateClassDto,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.classesService.createClasses(createClassDto);
    return {
      statusCode: HttpStatus.CREATED,
      error: null,
      message: 'Class created',
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Put(':classId')
  async updateClass(
    @Param('classId') classId: number,
    @Body() updateClassDto: UpdateClassDto,
  ): Promise<{ statusCode; error; message }> {
    await this.classesService.updateClass(classId, updateClassDto);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Class updated',
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExcelFilter,
    }),
  )
  async importClassList(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excelToJson = require('convert-excel-to-json');
    const excel = excelToJson(
      Object.assign(
        {
          source: file.buffer,
        },
        excelClassesFormat,
      ),
    );

    //typescript implementation is retarded
    // const tsFile = new File([file.buffer], file.filename);
    // const excel = excelToJson(tsFile, {
    //   sheet: 'Sheet1',
    // });

    const classes: addClassDto[] = [];

    //transform data
    try {
      const rawData: { name: string; grade: string }[] = excel['Sheet1'];
      //get schoolyear from index 0
      const schoolyear = rawData[0].name.replace('Năm học: ', '');
      //desirable data is from index 2 onward
      for (let i = 2; i < rawData.length; i++) {
        classes.push(Object.assign(rawData[i], { schoolYear: schoolyear }));
      }
    } catch (error) {
      throw new BadRequestException('Invalid Excel File Format');
    }

    console.log(classes);

    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Classes added succesfully',
      data: await this.classesService.addClasses(classes),
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('list')
  async getClassList(
    @Query() filter: ClassFilter,
  ): Promise<{ statusCode; error; message; data }> {
    const classFilter: ClassFilter = {};
    for (const prop in filter) {
      if (prop != 'page' && prop != 'limit') {
        classFilter[prop] = filter[prop];
      }
    }

    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get class list successfully',
      data: await this.classesService.getClassList(
        {
          page: filter.page ? filter.page : PaginationEnum.DefaultPage,
          limit: filter.limit ? filter.limit : PaginationEnum.DefaultLimit,
        },
        classFilter,
      ),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('list/:teacherId')
  async getClassListByTeacherId(
    @Param('teacherId') teacherId: number,
  ): Promise<{ statusCode; error; message; data }> {
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get class list successfully',
      data: await this.classesService.getClassListByTeacherId(teacherId),
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get('students/:classId')
  async getStudentsByClassId(
    @Param('classId') classId: number,
    @Query() filter: StudentFilter,
  ): Promise<{ statusCode; error; message; data }> {
    const studentFilter: StudentFilter = {};
    for (const prop in filter) {
      if (prop != 'page' && prop != 'limit') {
        studentFilter[prop] = filter[prop];
      }
    }
    const data = await this.classesService.getStudentByClassId(
      {
        page: filter.page ? filter.page : PaginationEnum.DefaultPage,
        limit: filter.limit ? filter.limit : PaginationEnum.DefaultLimit,
      },
      classId,
    );
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get student list successfully',
      data: data,
    };
  }
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Get(':classId')
  async getClassDetail(
    @Param('classId') classId: number,
  ): Promise<{ statusCode; error; message; data }> {
    const data = await this.classesService.getClassesDetail(classId);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Get class detail successfully',
      data: data,
    };
  }

  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.Teacher, Role.Administrator)
  @Delete(':classId')
  async delete(
    @Param('classId') classId: number,
  ): Promise<{ statusCode; error; message }> {
    await this.classesService.delete(classId);
    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Delete class successfully',
    };
  }
}
