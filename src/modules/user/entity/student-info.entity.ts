import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('student_info')
export class StudentInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'student_code', type: 'varchar', unique: true })
  studentCode: string;

  @Column({ name: 'ethnic_id', nullable: true })
  ethnic: number;

  @Column({ name: 'status_id', nullable: true })
  status: number;
}
