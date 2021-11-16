import { Test, TestingModule } from '@nestjs/testing';
import { PlayerDataController } from './player-data.controller';
import { PlayerDataService } from './player-data.service';

describe('PlayerDataController', () => {
  let controller: PlayerDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerDataController],
      providers: [PlayerDataService],
    }).compile();

    controller = module.get<PlayerDataController>(PlayerDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
