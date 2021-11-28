import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Lesson } from '../entities/lesson.entity';

export class UpdateLesssonDto extends PartialType(Lesson) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
