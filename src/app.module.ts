import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { LectureModule } from './modules/lecture/lecture.module';
import { QuestionModule } from './modules/question/question.module';
import { UserModule } from './modules/user/user.module';
import { TestModule } from './test/test.module';
import { UserClassModule } from './modules/user-class/user-class.module';
import { GradeModule } from './modules/grade/grade.module';
import { SchoolYearModule } from './modules/school-year/school-year.module';
import { UploadModule } from './modules/upload/upload.module';
import { LessonMaterialModule } from './modules/lesson-material/lesson-material.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      charset: 'utf8_unicode_ci',
    }),
    QuestionModule,
    TestModule,
    LectureModule,
    ClassesModule,
    AuthModule,
    UserModule,
    UserClassModule,
    GradeModule,
    SchoolYearModule,
    UploadModule,
    LessonMaterialModule,
    CurriculumModule,
  ],
})
export class AppModule {}
