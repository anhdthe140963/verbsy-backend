import { Module } from '@nestjs/common';
import { LessonMaterialService } from './lesson-material.service';
import { LessonMaterialController } from './lesson-material.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonMaterialRepository } from './repository/lesson-material.repository';
import { LessonRepository } from '../lesson/repository/lesson.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([LessonMaterialRepository, LessonRepository]),
  ],
  controllers: [LessonMaterialController],
  providers: [LessonMaterialService],
})
export class LessonMaterialModule {}
