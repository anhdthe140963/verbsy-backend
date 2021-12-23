import { Module } from '@nestjs/common';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { SchoolYearRepository } from './repository/school-year.repository';
import { ClassesRepository } from '../classes/repository/classes.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolYearRepository, ClassesRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SchoolYearController],
  providers: [SchoolYearService],
})
export class SchoolYearModule {}
