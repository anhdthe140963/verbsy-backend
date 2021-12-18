import { Question } from 'src/modules/question/entity/question.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertQuestion1637998613618 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const questionJson = await convertCsvToJson(
      'src/migration/csv/answer_question_csv/question/question_1_12.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Question)
      .values(questionJson)
      .execute();
  }

    public async up(queryRunner: QueryRunner): Promise<void> {
        //         const questionJson = await convertCsvToJson('src/migration/csv/answer_question_csv/question/question_1_12.csv');
        // await queryRunner.manager
        //   .createQueryBuilder()
        //   .insert()
        //   .into(Question)
        //   .values(questionJson)
        //   .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
