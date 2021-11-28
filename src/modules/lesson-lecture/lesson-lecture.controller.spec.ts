import { Test, TestingModule } from '@nestjs/testing';
import { LessonLectureController } from './lesson-lecture.controller';
import { LessonLectureService } from './lesson-lecture.service';

describe('LessonLectureController', () => {
  let controller: LessonLectureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonLectureController],
      providers: [LessonLectureService],
    }).compile();

    controller = module.get<LessonLectureController>(LessonLectureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
