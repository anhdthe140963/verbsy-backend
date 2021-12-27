import { PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TeacherInfo } from '../entity/teacher-info.entity';

export class UpdateTeacherInfoDto extends PartialType(TeacherInfo) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  teacherCode: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  contractType: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  qualification: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  subject: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  status: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  ethnic: number;
}
