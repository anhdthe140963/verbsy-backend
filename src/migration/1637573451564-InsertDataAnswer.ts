import { Answer } from 'src/modules/question/entity/answer.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class InsertDataAnswer1637573451564 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // const answerJson = await convertCsvToJson('src/migration/csv/answer.csv');
    // for(const j of answerJson){
    //    await queryRunner.query(`insert into answer(content, is_correct,questionId) values('${j['content']}','${j['isCorrect']}','${j['questionId']}')`);
    // }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
