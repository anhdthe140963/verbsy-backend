import { EntityRepository, Repository } from 'typeorm';
import { PlayerData } from '../entities/player-data.entity';
@EntityRepository(PlayerData)
export class PlayerDataRepository extends Repository<PlayerData> {
  async findPlayerDatasByPlayerId(playerId: number): Promise<PlayerData[]> {
    return await this.find({ playerId: playerId });
  }
}
