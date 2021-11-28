import { EntityRepository, Repository } from 'typeorm';
import { LessonMaterial } from '../entities/lesson-material.entity';

@EntityRepository(LessonMaterial)
export class LessonMaterialRepository extends Repository<LessonMaterial> {}
