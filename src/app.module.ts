import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ClassesModule } from './modules/classes/classes.module';
import { LectureModule } from './modules/lecture/lecture.module';
import { QuestionModule } from './modules/question/question.module';
import { UserModule } from './modules/user/user.module';
import { TestModule } from './test/test.module';
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
  ],
})
export class AppModule { }
