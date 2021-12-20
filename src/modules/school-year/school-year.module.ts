import { Module } from '@nestjs/common';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { SchoolYearRepository } from './repository/school-year.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolYearRepository]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SchoolYearController],
  providers: [SchoolYearService],
})
export class SchoolYearModule {}
