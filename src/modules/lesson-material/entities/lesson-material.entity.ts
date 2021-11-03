import { BaseEntity, Column, Entity } from 'typeorm';

@Entity('lesson_material')
export class LessonMaterial extends BaseEntity {
  @Column('int', { primary: true, generated: 'increment', name: 'id' })
  id: number;

  @Column('varchar', { name: 'display_name' })
  displayName: string;

  @Column('varchar', { name: 'lesson_id' })
  lessonId: number;

  @Column('varchar', { name: 'uploader_id' })
  uploaderId: number;

  @Column('varchar', { name: 'url' })
  url: string;

  @Column('timestamp', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  constructor(partial: Partial<LessonMaterial>) {
    super();
    Object.assign(this, partial);
  }
}
