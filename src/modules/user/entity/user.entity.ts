import * as bcrypt from 'bcrypt';
import { Role } from 'src/constant/role.enum';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'username', type: 'text', nullable: true })
  username: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ name: 'full_name', type: 'text', nullable: true })
  fullName: string;

  @Column({ name: 'email', type: 'text', nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'gender', type: 'boolean', default: true })
  gender: boolean;

  @Column({ name: 'role', default: Role.Teacher })
  role: Role;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob: string;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @Column({ nullable: true, select: false })
  salt: string;

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
