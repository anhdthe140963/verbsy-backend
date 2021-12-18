import { Lesson } from 'src/modules/curriculum/entities/lesson.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertLesson1637998584963 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lessonJson = await convertCsvToJson('src/migration/csv/lesson.csv');
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Lesson)
      .values(lessonJson)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
