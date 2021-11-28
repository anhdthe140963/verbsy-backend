import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TeacherInfo } from '../entity/teacher-info.entity';

export class UpdateTeacherInfoDto extends PartialType(TeacherInfo) {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  teacherCode: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  position: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contractType: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  qualification: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  teachingSubject: string;
}
