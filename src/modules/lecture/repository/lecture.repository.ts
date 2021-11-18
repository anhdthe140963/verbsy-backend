import { EntityRepository, Repository } from 'typeorm';
import { Lecture } from '../entity/lecture.entity';

@EntityRepository(Lecture)
export class LectureRepository extends Repository<Lecture> {
  async getLecturesByLectureIds(ids: number[]): Promise<Lecture[]> {
    return await this.createQueryBuilder()
      .where('id IN (:...ids)', {
        ids: ids,
      })
      .getMany();
  }
}
