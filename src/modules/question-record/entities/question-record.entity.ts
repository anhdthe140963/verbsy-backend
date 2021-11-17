import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('question_record')
export class QuestionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'answered_players' })
  answeredPlayers: number;

  @Column({ name: 'is_question_live', default: true })
  isQuestionLive: boolean;
}
