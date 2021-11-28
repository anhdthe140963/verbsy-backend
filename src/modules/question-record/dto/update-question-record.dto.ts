import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionRecordDto } from './create-question-record.dto';

export class UpdateQuestionRecordDto extends PartialType(CreateQuestionRecordDto) {}
