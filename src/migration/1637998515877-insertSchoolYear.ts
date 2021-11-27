import { SchoolYear } from "src/modules/school-year/entities/school-year.entity";
import {MigrationInterface, QueryRunner} from "typeorm";
import { convertCsvToJson } from "./convert/convert-csv-to-json";

export class insertSchoolYear1637998515877 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const schoolYearJson = await convertCsvToJson('src/migration/csv/school_year.csv');
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(SchoolYear)
          .values(schoolYearJson)
          .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
