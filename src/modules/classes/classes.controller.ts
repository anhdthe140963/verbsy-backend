import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'src/constant/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { UpdateResult } from 'typeorm';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-classes.dto';
import { UpdateClassDto } from './dto/update-classes.dto';
import { Classes } from './entity/classes.entity';
import { Express } from 'express';
import fileExcelFilter from '../../filter/file.excel.filter';
import { addClassDto } from './dto/add-class.dto';
import excelClassesFormat from 'excel-format/classes.format.json';
@Controller('class')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) { }
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
        classes.push(Object.assign(rawData[i], { schoolyear: schoolyear }));
      }
    } catch (error) {
      throw new BadRequestException('Invalid Excel File Format');
    }

    return {
      statusCode: HttpStatus.OK,
      error: null,
      message: 'Classes added succesfully',
      data: await this.classesService.addClasses(classes),
    };
  }
}
