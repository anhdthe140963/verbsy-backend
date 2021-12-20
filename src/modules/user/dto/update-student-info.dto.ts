import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StudentInfo } from '../entity/student-info.entity';

export class UpdateStudentInfoDto extends PartialType(StudentInfo) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  ethnic: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status: number;
}
