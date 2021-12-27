import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('teacher_info')
export class TeacherInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'teacher_code', type: 'varchar', unique: true })
  teacherCode: string;

  @Column({ name: 'contract_type_id', nullable: true })
  contractType: number;

  @Column({ name: 'qualification_id', nullable: true })
  qualification: number;

  @Column({ name: 'subject_id', nullable: true })
  subject: number;

  @Column({ name: 'status_id', nullable: true })
  status: number;

  @Column({ name: 'ethnic_id', nullable: true })
  ethnic: number;
}
