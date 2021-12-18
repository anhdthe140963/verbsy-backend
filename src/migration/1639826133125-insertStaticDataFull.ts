import { ContractType } from 'src/modules/static-data/entities/contract-type.entity';
import { Qualification } from 'src/modules/static-data/entities/qualification.entity';
import { StudentStatus } from 'src/modules/static-data/entities/student-status.entity';
import { Subject } from 'src/modules/static-data/entities/subject.entity';
import { TeacherStatus } from 'src/modules/static-data/entities/teacher-status.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertStaticDataFull1639826133125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const contractTypes = await convertCsvToJson(
      'src/migration/csv/static-data/contract-type.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(ContractType)
      .values(contractTypes)
      .execute();

    const qualifications = await convertCsvToJson(
      'src/migration/csv/static-data/qualification.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Qualification)
      .values(qualifications)
      .execute();

    const studentStatuses = await convertCsvToJson(
      'src/migration/csv/static-data/student-status.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(StudentStatus)
      .values(studentStatuses)
      .execute();

    const subjects = await convertCsvToJson(
      'src/migration/csv/static-data/subject.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Subject)
      .values(subjects)
      .execute();

    const teacherStatuses = await convertCsvToJson(
      'src/migration/csv/static-data/teacher-status.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(TeacherStatus)
      .values(teacherStatuses)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
