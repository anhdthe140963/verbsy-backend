import { Injectable } from '@nestjs/common';
import { CreateQuestionRecordDto } from './dto/create-question-record.dto';
import { UpdateQuestionRecordDto } from './dto/update-question-record.dto';

@Injectable()
export class QuestionRecordService {
  create(createQuestionRecordDto: CreateQuestionRecordDto) {
    return 'This action adds a new questionRecord';
  }

  findAll() {
    return `This action returns all questionRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} questionRecord`;
  }

  update(id: number, updateQuestionRecordDto: UpdateQuestionRecordDto) {
    return `This action updates a #${id} questionRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} questionRecord`;
  }
}
