import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('demo_table')
export class Demo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'field_one', type: 'text' })
  fieldOne: string;
}
