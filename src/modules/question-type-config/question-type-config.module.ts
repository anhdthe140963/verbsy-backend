import { Module } from '@nestjs/common';
import { QuestionTypeConfigService } from './question-type-config.service';
import { QuestionTypeConfigController } from './question-type-config.controller';

@Module({
  controllers: [QuestionTypeConfigController],
  providers: [QuestionTypeConfigService],
})
export class QuestionTypeConfigModule {}
