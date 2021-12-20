import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesRepository } from './repository/classes.repository';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from '../user/repository/user.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { StudentInfoRepository } from '../user/repository/student-info.repository';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';
import { GradeRepository } from '../grade/repository/grade.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      ClassesRepository,
      UserRepository,
      UserClassRepository,
      StudentInfoRepository,
      SchoolYearRepository,
      GradeRepository,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
