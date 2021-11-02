import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  schoolYearId: number;
}
