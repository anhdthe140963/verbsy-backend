import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lesson_lecture')
export class LessonLecture {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id' })
  lessonId: number;

  @Column({ name: 'lecture_id' })
  lectureId: number;
}
