import { Test, TestingModule } from '@nestjs/testing';
import { LessonMaterialService } from './lesson-material.service';

describe('LessonMaterialService', () => {
  let service: LessonMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonMaterialService],
    }).compile();

    service = module.get<LessonMaterialService>(LessonMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
