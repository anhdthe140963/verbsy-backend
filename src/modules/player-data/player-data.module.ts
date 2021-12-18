import { Module } from '@nestjs/common';
import { PlayerDataService } from './player-data.service';
import { PlayerDataController } from './player-data.controller';

@Module({
  controllers: [PlayerDataController],
  providers: [PlayerDataService],
})
export class PlayerDataModule {}
