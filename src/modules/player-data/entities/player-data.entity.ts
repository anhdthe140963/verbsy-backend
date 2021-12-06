import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('player_data')
export class PlayerData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id' })
  playerId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'question', nullable: true })
  question: string;

  @Column({ name: 'answer_id', nullable: true })
  answerId: number;

  @Column({ name: 'answer', nullable: true })
  answer: string;

  @Column({ name: 'is_correct', nullable: true, default: null })
  isCorrect: boolean;

  @Column({ name: 'answer_time', default: 0 })
  answerTime: number;

  @Column({ name: 'score', default: 0 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
