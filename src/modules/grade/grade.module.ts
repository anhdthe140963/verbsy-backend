import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { PassportModule } from '@nestjs/passport';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      SchoolYear,
      ClassesRepository,
      UserClassRepository,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
