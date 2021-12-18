import { Ethnic } from 'src/modules/static-data/entities/ethnic.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertStaticData1639825067217 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const ethnics = await convertCsvToJson(
      'src/migration/csv/static-data/ethnic.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Ethnic)
      .values(ethnics)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
