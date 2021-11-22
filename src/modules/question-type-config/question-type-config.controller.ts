import { Controller } from '@nestjs/common';
import { QuestionTypeConfigService } from './question-type-config.service';

@Controller('question-type-config')
export class QuestionTypeConfigController {
  constructor(
    private readonly questionTypeConfigService: QuestionTypeConfigService,
  ) {}
}
