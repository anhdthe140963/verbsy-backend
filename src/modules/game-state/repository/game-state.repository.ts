import { EntityRepository, Repository } from 'typeorm';
import { GameState } from '../entities/game-state.entity';

@EntityRepository(GameState)
export class GameStateRepository extends Repository<GameState> {}
