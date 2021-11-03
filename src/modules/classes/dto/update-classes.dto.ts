import { PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateClassDto } from './create-classes.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsString()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  teacherIds: number[];

  @IsNotEmpty()
  @IsOptional()
  gradeId: number;

  @IsNotEmpty()
  @IsOptional()
  schoolYearId: number;
}
