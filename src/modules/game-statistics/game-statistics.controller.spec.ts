import { Test, TestingModule } from '@nestjs/testing';
import { GameStatisticsController } from './game-statistics.controller';
import { GameStatisticsService } from './game-statistics.service';

describe('GameStatisticsController', () => {
  let controller: GameStatisticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameStatisticsController],
      providers: [GameStatisticsService],
    }).compile();

    controller = module.get<GameStatisticsController>(GameStatisticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
