import { Test, TestingModule } from '@nestjs/testing';
import { LessonMaterialController } from './lesson-material.controller';
import { LessonMaterialService } from './lesson-material.service';

describe('LessonMaterialController', () => {
  let controller: LessonMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonMaterialController],
      providers: [LessonMaterialService],
    }).compile();

    controller = module.get<LessonMaterialController>(LessonMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
