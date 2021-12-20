import { EntityRepository, Repository } from 'typeorm';
import { ContractType } from '../entities/contract-type.entity';

@EntityRepository(ContractType)
export class ContractTypeRepository extends Repository<ContractType> {}
