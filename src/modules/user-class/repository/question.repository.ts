import { EntityRepository, Repository } from 'typeorm';
import { UserClass } from '../entity/user-class.entity';

@EntityRepository(UserClass)
export class UserClassRepository extends Repository<UserClass> {}
