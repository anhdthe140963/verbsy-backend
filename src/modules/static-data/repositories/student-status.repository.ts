import { EntityRepository, Repository } from 'typeorm';
import { StudentStatus } from '../entities/student-status.entity';

@EntityRepository(StudentStatus)
export class StudentStatusRepository extends Repository<StudentStatus> {}
