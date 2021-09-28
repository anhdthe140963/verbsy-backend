import { EntityRepository, Repository } from 'typeorm';
import { Classes } from '../entity/classes.entity';

@EntityRepository(Classes)
export class ClassesRepository extends Repository<Classes> {}
