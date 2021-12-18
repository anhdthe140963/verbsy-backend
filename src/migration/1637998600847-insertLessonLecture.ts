import { LessonLecture } from 'src/modules/lesson-lecture/entities/lesson-lecture.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { convertCsvToJson } from './convert/convert-csv-to-json';

export class insertLessonLecture1637998600847 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lessonLectureJson = await convertCsvToJson(
      'src/migration/csv/lesson_lecture.csv',
    );
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(LessonLecture)
      .values(lessonLectureJson)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
