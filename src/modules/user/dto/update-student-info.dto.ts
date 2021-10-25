import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StudentInfo } from '../entity/student-info.entity';

export class UpdateStudentInfoDto extends PartialType(StudentInfo) {
  @IsNotEmpty()
  @IsOptional()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  ethnic: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status: string;

  @IsNotEmpty()
  @IsOptional()
  currentExp: number;

  @IsNotEmpty()
  @IsOptional()
  reqExp: number;

  @IsNotEmpty()
  @IsOptional()
  level: number;
}
