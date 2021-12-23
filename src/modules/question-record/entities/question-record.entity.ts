import { QuestionType } from 'src/constant/question-type.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('question_record')
export class QuestionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({ name: 'question_id', nullable: true })
  questionId: number;

  @Column({ name: 'question_type', default: QuestionType.MultipleChoice })
  questionType: QuestionType;

  @Column({ name: 'answered_players' })
  answeredPlayers: number;
}
