import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  studentCode: string;
  @IsString()
  @IsNotEmpty()
  fullName: string;
  @IsString()
  @IsNotEmpty()
  dob: string;
  @IsNotEmpty()
  gender: boolean;
  @IsInt()
  @IsNotEmpty()
  ethnic: number;
  @IsInt()
  @IsNotEmpty()
  status: number;
  @IsString()
  @IsNotEmpty()
  phone: string;
}
