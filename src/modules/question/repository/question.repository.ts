import { EntityRepository, Repository } from 'typeorm';
import { Question } from '../entity/question.entity';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {}
