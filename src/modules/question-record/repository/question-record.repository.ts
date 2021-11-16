import { EntityRepository, Repository } from 'typeorm';
import { QuestionRecord } from '../entities/question-record.entity';
@EntityRepository(QuestionRecord)
export class QuestionRecordRepository extends Repository<QuestionRecord> {}
