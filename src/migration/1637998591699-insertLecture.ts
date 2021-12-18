import { Lecture } from 'src/modules/lecture/entity/lecture.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertLecture1637998591699 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lectureJson = await convertCsvToJson('src/migration/csv/lecture.csv');
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Lecture)
      .values(lectureJson)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
