import { Module } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from '../grade/entities/grade.entity';
import { ClassesRepository } from '../classes/repository/classes.repository';
import { UserRepository } from '../user/repository/user.repository';
import { Curriculum } from './entities/curriculum.entity';
import { PassportModule } from '@nestjs/passport';
import { Lesson } from './entities/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grade,
      ClassesRepository,
      UserRepository,
      Curriculum,
      Lesson,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
})
export class CurriculumModule {}
