import { EntityRepository, Repository } from 'typeorm';
import { Blacklist } from '../entities/blacklist.entity';

@EntityRepository(Blacklist)
export class BlacklistRepository extends Repository<Blacklist> {}
