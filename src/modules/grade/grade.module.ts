import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { GradeRepository } from './repository/school-year.repository';
import { SchoolYearRepository } from '../school-year/repository/school-year.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GradeRepository,
      SchoolYearRepository,
      ClassesRepository,
      UserClassRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
