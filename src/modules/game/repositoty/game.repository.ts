import { EntityRepository, Repository } from 'typeorm';
import { Game } from '../entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async isGameExist(gameId: number): Promise<boolean> {
    const game = await this.findOne(gameId);
    if (game) {
      return true;
    }
    return false;
  }
}
