import { EntityRepository, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async playerJoin(gameId: number, studentId: number): Promise<Player> {
    const player = new Player();
    player.gameId = gameId;
    player.studentId = studentId;
    return await player.save();
  }

  async isStudentAlreadyJoin(
    gameId: number,
    studentId: number,
  ): Promise<boolean> {
    const player = await this.findOne({ gameId, studentId });
    if (player) {
      return true;
    }
    return false;
  }

  async findPlayersByGameId(gameId: number): Promise<Player[]> {
    return await this.find({ gameId: gameId });
  }
}
