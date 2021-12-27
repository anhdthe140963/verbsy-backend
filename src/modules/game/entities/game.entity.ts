import { GameStatus } from 'src/constant/game-status.enum';
import { QuestionType } from 'src/constant/question-type.enum';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('game')
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lecture_id' })
  lectureId: number;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'host_id' })
  hostId: number;

  @Column({ name: 'status', default: GameStatus.Hosted })
  status: GameStatus;

  @Column({
    name: 'questions_config',
    type: 'json',
    nullable: true,
  })
  questionsConfig: {
    questions: number;
    timeFactorWeight: number;
    questionTypes: QuestionType[];
  };

  @Column({
    name: 'difficulty_config',
    type: 'json',
    nullable: true,
  })
  difficultyConfig: {
    easy: number;
    medium: number;
    hard: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'ended_at', nullable: true, default: null })
  endedAt: Date;
}
