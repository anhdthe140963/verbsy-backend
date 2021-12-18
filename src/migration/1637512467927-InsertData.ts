import { Lecture } from 'src/modules/lecture/entity/lecture.entity';
import { Question } from 'src/modules/question/entity/question.entity';
import { User } from 'src/modules/user/entity/user.entity';
import { Answer } from 'src/modules/question/entity/answer.entity';
import { UserClass } from 'src/modules/user-class/entity/user-class.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class InsertData1637512467927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // const userJson = await convertCsvToJson('src/migration/csv/user.csv');
    // await queryRunner.manager
    //   .createQueryBuilder()
    //   .insert()
    //   .into(User)
    //   .values(userJson)
    //   .execute();
    // const lectureJson = await convertCsvToJson('src/migration/csv/lecture.csv');
    //   await queryRunner.manager
    //     .createQueryBuilder()
    //     .insert()
    //     .into(Lecture)
    //     .values(lectureJson)
    //     .execute();
    // const questionJson = await convertCsvToJson('src/migration/csv/question.csv');
    // await queryRunner.manager
    //   .createQueryBuilder()
    //   .insert()
    //   .into(Question)
    //   .values(questionJson)
    //   .execute();
    // const userClassJson = await convertCsvToJson('src/migration/csv/user_class.csv');
    // await queryRunner.manager
    //   .createQueryBuilder()
    //   .insert()
    //   .into(UserClass)
    //   .values(userClassJson)
    //   .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
