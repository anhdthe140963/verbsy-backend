import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from './modules/classes/classes.module';
import { LectureModule } from './modules/lecture/lecture.module';
import { QuestionModule } from './modules/question/question.module';
import { TestModule } from './test/test.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(),
    QuestionModule,
    TestModule,
    LectureModule,
    ClassesModule,
  ],
})
export class AppModule {}
