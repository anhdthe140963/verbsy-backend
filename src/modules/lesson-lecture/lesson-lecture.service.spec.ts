import { Test, TestingModule } from '@nestjs/testing';
import { LessonLectureService } from './lesson-lecture.service';

describe('LessonLectureService', () => {
  let service: LessonLectureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonLectureService],
    }).compile();

    service = module.get<LessonLectureService>(LessonLectureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
