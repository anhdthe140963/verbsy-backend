import { ScreenState } from 'src/constant/screen-state.enum';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('game_state')
export class GameState extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id', unique: true })
  gameId: number;

  @Column({ name: 'current_question_id' })
  currentQuestionId: number;

  @Column({ name: 'screen_state' })
  screenState: ScreenState;

  @Column({ name: 'time_left' })
  timeLeft: number;
}
