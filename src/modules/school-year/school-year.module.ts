import { Module } from '@nestjs/common';
import { SchoolYearService } from './school-year.service';
import { SchoolYearController } from './school-year.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([SchoolYear]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [SchoolYearController],
  providers: [SchoolYearService],
})
export class SchoolYearModule {}
