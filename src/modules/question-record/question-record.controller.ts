import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuestionRecordService } from './question-record.service';
import { CreateQuestionRecordDto } from './dto/create-question-record.dto';
import { UpdateQuestionRecordDto } from './dto/update-question-record.dto';

@Controller('question-record')
export class QuestionRecordController {
  constructor(private readonly questionRecordService: QuestionRecordService) {}

  @Post()
  create(@Body() createQuestionRecordDto: CreateQuestionRecordDto) {
    return this.questionRecordService.create(createQuestionRecordDto);
  }

  @Get()
  findAll() {
    return this.questionRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionRecordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionRecordDto: UpdateQuestionRecordDto) {
    return this.questionRecordService.update(+id, updateQuestionRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionRecordService.remove(+id);
  }
}
