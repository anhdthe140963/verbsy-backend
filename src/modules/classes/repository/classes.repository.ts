import { EntityRepository, Repository } from 'typeorm';
import { Classes } from '../entity/classes.entity';

@EntityRepository(Classes)
export class ClassesRepository extends Repository<Classes> {
  async isClassExist(classId: number): Promise<boolean> {
    const classById = await this.findOne(classId);
    if (classById) {
      return true;
    }
    return false;
  }
}
