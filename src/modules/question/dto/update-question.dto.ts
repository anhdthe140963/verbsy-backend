import { PartialType } from '@nestjs/swagger';
import { CreateQuestionDto } from './question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
