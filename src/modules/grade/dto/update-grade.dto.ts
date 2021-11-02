import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Grade } from '../entities/grade.entity';

export class UpdateGradeDto extends PartialType(Grade) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
