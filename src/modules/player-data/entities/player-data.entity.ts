import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('player_data')
export class PlayerData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'score' })
  score: number;

  @Column({ name: 'answer_id' })
  answerId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'answer_time' })
  answerTime: number;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;
}
