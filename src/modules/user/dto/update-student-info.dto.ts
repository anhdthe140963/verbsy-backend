import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StudentInfo } from '../entity/student-info.entity';

export class UpdateStudentInfoDto extends PartialType(StudentInfo) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  studentCode: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  ethnic: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  status: number;
}
