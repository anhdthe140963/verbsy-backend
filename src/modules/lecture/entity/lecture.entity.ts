import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lecture')
export class Lecture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column()
  publicity: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text' })
  description: string;
}
