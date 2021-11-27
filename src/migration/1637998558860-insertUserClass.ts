import { UserClass } from "src/modules/user-class/entity/user-class.entity";
import {MigrationInterface, QueryRunner} from "typeorm";
import { convertCsvToJson } from "./convert/convert-csv-to-json";

export class insertUserClass1637998558860 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const userClassJson = await convertCsvToJson('src/migration/csv/user_class.csv');
        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(UserClass)
          .values(userClassJson)
          .execute();
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
