import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('game_state')
export class GameState extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({ name: 'current_question_id' })
  currentQuestionId: number;

  @Column({ name: 'time_left' })
  timeLeft: number;
}
