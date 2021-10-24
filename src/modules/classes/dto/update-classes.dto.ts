import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateClassDto } from './create-classes.dto';

export class UpdateClassDto extends PartialType(CreateClassDto) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  teacherId: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  grade: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  schoolYear: string;
}
