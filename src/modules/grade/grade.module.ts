import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './entities/grade.entity';
import { PassportModule } from '@nestjs/passport';
import { SchoolYear } from '../school-year/entities/school-year.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade, SchoolYear]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [GradeController],
  providers: [GradeService],
})
export class GradeModule {}
