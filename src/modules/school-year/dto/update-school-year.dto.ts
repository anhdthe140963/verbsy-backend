import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SchoolYear } from '../entities/school-year.entity';

export class UpdateSchoolYearDto extends PartialType(SchoolYear) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;
}
