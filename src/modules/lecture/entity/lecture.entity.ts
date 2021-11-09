import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lecture')
export class Lecture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createAt: Date;

  @Column({ name: 'lesson_id', nullable: true })
  lessonId: number;
}
