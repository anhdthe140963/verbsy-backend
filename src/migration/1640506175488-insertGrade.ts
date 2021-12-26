import { Grade } from 'src/modules/grade/entities/grade.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertGrade1640506175488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const grades = await convertCsvToJson('src/migration/csv/grade.csv');
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Grade)
      .values(grades)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
