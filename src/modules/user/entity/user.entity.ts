import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'username', type: 'text' })
  username: string;

  @Column()
  password: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName: string;

  @Column({ name: 'email', type: 'text' })
  email: string;

  @Column()
  phone: string;

  @Column({ name: 'role_id', type: 'tinyint' })
  roleId: number;

  @Column({ type: 'text' })
  avatar: string;
}
