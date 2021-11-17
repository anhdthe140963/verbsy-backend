import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('game')
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lecture_id' })
  lectureId: number;

  @Column({ name: 'class_id' })
  classId: number;

  @Column({ name: 'game_type', type: 'tinyint', default: 0 })
  gameType: number;

  @Column({ name: 'host_id' })
  hostId: number;

  @Column({ name: 'is_game_live', type: 'boolean', default: true })
  isGameLive: boolean;

  @Column({ name: 'config_id', nullable: true })
  configId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
