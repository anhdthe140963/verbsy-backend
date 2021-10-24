import { EntityRepository, Repository } from 'typeorm';
import { StudentInfo } from '../entity/student-info.entity';

@EntityRepository(StudentInfo)
export class StudentInfoRepository extends Repository<StudentInfo> {}
