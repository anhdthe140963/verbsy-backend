import { EntityRepository, Repository } from 'typeorm';
import { TeacherStatus } from '../entities/teacher-status.entity';

@EntityRepository(TeacherStatus)
export class TeacherStatusRepository extends Repository<TeacherStatus> {}
