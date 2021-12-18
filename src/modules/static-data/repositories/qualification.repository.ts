import { EntityRepository, Repository } from 'typeorm';
import { Qualification } from '../entities/qualification.entity';

@EntityRepository(Qualification)
export class QualificationRepository extends Repository<Qualification> {}
