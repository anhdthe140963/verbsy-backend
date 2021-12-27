import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StaticDataService } from './static-data.service';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import fileExcelFilter from 'src/filter/file.excel.filter';

@UseGuards(RolesGuard)
@Controller('static-data')
export class StaticDataController {
  constructor(private readonly staticDataService: StaticDataService) {}
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileExcelFilter,
    }),
  )
  async importStaticData(@UploadedFile() file: Express.Multer.File) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const excelToJson = require('convert-excel-to-json');
      const excel = excelToJson({
        source: file.buffer,
        header: {
          rows: 0,
        },
        sheets: ['Sheet1'],
        columnToKey: {
          A: 'ethnic',
          B: 'studentStatus',
          C: 'teacherStatus',
          D: 'subject',
          E: 'contractType',
          F: 'qualification',
        },
      });

      console.log(excel);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid Excel File Format');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Static Data imported succesfully',
      data: 'h',
    };
  }

  @Get()
  async getStaticData(@Query() query: []) {
    console.log(query);

    const data = await this.staticDataService.getStaticData();
    return {
      statusCode: HttpStatus.OK,
      message: 'Get Static Data succesfully',
      data: data,
    };
  }
}
