import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('curriculum')
export class Curriculum extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'grade_id', nullable: true })
  gradeId: number;

  @Column({ name: 'class_id', nullable: true })
  classId: number;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;
}
