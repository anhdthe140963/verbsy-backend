import { Curriculum } from 'src/modules/curriculum/entities/curriculum.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertCurriculum1637998574809 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const curriculumJson = await convertCsvToJson(
      'src/migration/csv/curriculum.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Curriculum)
      .values(curriculumJson)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
