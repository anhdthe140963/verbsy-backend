import { QuestionType } from 'src/constant/question-type.enum';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('question_type_config')
export class QuestionTypeConfig extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'game_id' })
  gameId: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'question_type' })
  questionType: QuestionType;
}
