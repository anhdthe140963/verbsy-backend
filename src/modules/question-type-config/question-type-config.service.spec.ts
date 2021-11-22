import { Test, TestingModule } from '@nestjs/testing';
import { QuestionTypeConfigService } from './question-type-config.service';

describe('QuestionTypeConfigService', () => {
  let service: QuestionTypeConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionTypeConfigService],
    }).compile();

    service = module.get<QuestionTypeConfigService>(QuestionTypeConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
