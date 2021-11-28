import { EntityRepository, Repository } from 'typeorm';
import { Answer } from '../entity/answer.entity';

@EntityRepository(Answer)
export class AnswerRepository extends Repository<Answer> {}
