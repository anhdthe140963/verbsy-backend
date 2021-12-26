import { PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Classes } from '../entity/classes.entity';

export class UpdateClassDto extends PartialType(Classes) {
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
}
