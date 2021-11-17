import { HostGameDto } from 'src/modules/game-server/dto/host-game.dto';
import { EntityRepository, Repository } from 'typeorm';
import { Game } from '../entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async hostNewGame(hostGameDto: HostGameDto): Promise<Game> {
    const game = new Game();
    game.lectureId = hostGameDto.lectureId;
    game.hostId = hostGameDto.hostId;
    game.classId = hostGameDto.classId;
    return await game.save();
  }

  async findActiveGames(classId: number): Promise<Game[]> {
    return await this.find({ isGameLive: true, classId });
  }

  async isGameExist(gameId: number): Promise<boolean> {
    const game = await this.findOne(gameId);
    if (game) {
      return true;
    }
    return false;
  }
}
