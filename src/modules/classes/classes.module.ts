import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesRepository } from './repository/classes.repository';
import { PassportModule } from '@nestjs/passport';
import { UserRepository } from '../user/repository/user.repository';
import { UserClassRepository } from '../user-class/repository/question.repository';
import { StudentInfoRepository } from '../user/repository/student-info.repository';
import { SchoolYear } from '../school-year/entities/school-year.entity';
import { Grade } from '../grade/entities/grade.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([
      ClassesRepository,
      UserRepository,
      UserClassRepository,
      StudentInfoRepository,
      SchoolYear,
      Grade,
    ]),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
