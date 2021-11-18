import { EntityRepository, Repository } from 'typeorm';
import { Curriculum } from '../entities/curriculum.entity';
@EntityRepository(Curriculum)
export class CurriculumRepository extends Repository<Curriculum> {
  async getCurriculumByClassId(classId: number): Promise<Curriculum[]> {
    return await this.find({ classId });
  }
}
