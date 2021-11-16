import { Test, TestingModule } from '@nestjs/testing';
import { PlayerDataService } from './player-data.service';

describe('PlayerDataService', () => {
  let service: PlayerDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerDataService],
    }).compile();

    service = module.get<PlayerDataService>(PlayerDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
