import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('teacher_info')
export class TeacherInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @Column({ name: 'teacher_code', type: 'varchar', unique: true })
  teacherCode: string;

  @Column({ name: 'position', type: 'varchar' })
  position: string;

  @Column({ name: 'title', type: 'varchar', nullable: true })
  title: string;

  @Column({ name: 'contract_type', type: 'varchar' })
  contractType: string;

  @Column({ name: 'qualification', type: 'varchar' })
  qualification: string;

  @Column({ name: 'teaching_subject', type: 'varchar', nullable: true })
  teachingSubject: string;
}
