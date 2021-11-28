import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Curriculum } from '../entities/curriculum.entity';

export class UpdateCurriculumDto extends PartialType(Curriculum) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  gradeId: number;

  @IsNotEmpty()
  @IsOptional()
  classId: number;

  @IsNotEmpty()
  @IsOptional()
  parentId: number;
}
