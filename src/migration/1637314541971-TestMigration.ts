import { Grade } from 'src/modules/grade/entities/grade.entity';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class TestMigration1637314541971 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.createTable(
    //   new Table({
    //     name: 'test_migration',
    //     columns: [
    //       {
    //         name: 'id',
    //         type: 'int',
    //         isPrimary: true,
    //       },
    //       {
    //         name: 'name',
    //         type: 'varchar',
    //       },
    //       {
    //         name: 'created_at',
    //         type: 'timestamp',
    //         default: 'now()',
    //       },
    //     ],
    //   }),
    //   true,
    // );
    const json = await convertCsvToJson('src/migration/csv/grade.csv');
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Grade)
      .values(json)
      .execute();
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.dropTable('test_migration');
  }
}
