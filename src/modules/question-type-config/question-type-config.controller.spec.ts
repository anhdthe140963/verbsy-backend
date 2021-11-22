import { Test, TestingModule } from '@nestjs/testing';
import { QuestionTypeConfigController } from './question-type-config.controller';
import { QuestionTypeConfigService } from './question-type-config.service';

describe('QuestionTypeConfigController', () => {
  let controller: QuestionTypeConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionTypeConfigController],
      providers: [QuestionTypeConfigService],
    }).compile();

    controller = module.get<QuestionTypeConfigController>(QuestionTypeConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
