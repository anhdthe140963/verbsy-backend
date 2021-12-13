import { EntityRepository, Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

@EntityRepository(Grade)
export class GradeRepository extends Repository<Grade> {}
