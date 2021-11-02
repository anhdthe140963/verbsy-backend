import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('user_class')
export class UserClass extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'int', nullable: true })
  studentId: number;

  @Column({ name: 'teacher_id', type: 'int', nullable: true })
  teacherId: number;

  @Column({ name: 'class_id', type: 'int' })
  classId: number;
}
