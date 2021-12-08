import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('student_info')
export class StudentInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'student_code', type: 'varchar', unique: true })
  studentCode: string;

  @Column({ name: 'ethnic', type: 'varchar' })
  ethnic: string;

  @Column({ name: 'status', type: 'varchar', nullable: true })
  status: string;
}
