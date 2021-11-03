import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  gradeId: number;

  @IsNotEmpty()
  @IsNumber()
  schoolYearId: number;

  @IsArray()
  teacherIds: number[];
}
