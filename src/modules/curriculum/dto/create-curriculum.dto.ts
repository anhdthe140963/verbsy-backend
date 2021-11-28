import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  gradeId: number;

  @IsNotEmpty()
  @IsOptional()
  classId: number;

  @IsNotEmpty()
  @IsOptional()
  parentId: number;
}
