import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('classes')
export class Classes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'grade_id' })
  gradeId: number;

  @Column({ name: 'school_year_id' })
  schoolYearId: number;
}
