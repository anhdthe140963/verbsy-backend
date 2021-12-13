import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SchoolYear } from '../entities/school-year.entity';

export class UpdateSchoolYearDto extends PartialType(SchoolYear) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
