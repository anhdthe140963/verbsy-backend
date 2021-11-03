import { EntityRepository, Repository } from 'typeorm';
import { TeacherInfo } from '../entity/teacher-info.entity';

@EntityRepository(TeacherInfo)
export class TeacherInfoRepository extends Repository<TeacherInfo> {}
