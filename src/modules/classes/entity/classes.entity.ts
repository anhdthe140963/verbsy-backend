import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classes')
export class Classes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'teacher_id', nullable: true })
  teacherId: number;

  @Column({ name: 'grade', type: 'varchar' })
  grade: string;

  @Column({ name: 'schoolyear', type: 'varchar' })
  schoolyear: string;
}
