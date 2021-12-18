import { EntityRepository, Repository } from 'typeorm';
import { Ethnic } from '../entities/ethnic.entity';

@EntityRepository(Ethnic)
export class EthnicRepository extends Repository<Ethnic> {}
