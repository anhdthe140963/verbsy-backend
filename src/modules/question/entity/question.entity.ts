import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('question')
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lecture_id' })
  lectureId: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'tinyint' })
  type: number;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column()
  duration: number;
}
