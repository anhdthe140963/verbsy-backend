import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesRepository } from './repository/classes.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ClassesRepository])],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
