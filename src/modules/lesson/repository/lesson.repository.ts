import { Lesson } from 'src/modules/curriculum/entities/lesson.entity';
import { EntityRepository, Repository } from 'typeorm';
@EntityRepository(Lesson)
export class LessonRepository extends Repository<Lesson> {}
