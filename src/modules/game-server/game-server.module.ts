import { Module } from '@nestjs/common';
import { GameServerGateway } from './game-server.gateway';

@Module({
  providers: [GameServerGateway],
})
export class GameServerModule {}
