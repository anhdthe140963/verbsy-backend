import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './answer.entity';

@Entity('question')
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lecture_id' })
  lectureId: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column()
  duration: number;

  @OneToMany(() => Answer, (answer) => answer.question, {
    eager: true,
    cascade: true,
  })
  answers: Answer[];
}
