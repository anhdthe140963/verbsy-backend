import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  teacherCode: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsBoolean()
  @IsNotEmpty()
  gender: boolean;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsInt()
  @IsNotEmpty()
  contractType: number;

  @IsInt()
  @IsNotEmpty()
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
