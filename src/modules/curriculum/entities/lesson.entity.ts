import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('lesson')
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curriculum_id' })
  curriculumId: number;

  @Column()
  position: number;

  @Column()
  name: string;
}
