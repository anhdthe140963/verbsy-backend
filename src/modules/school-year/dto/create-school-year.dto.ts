import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsNotEmpty()
  endDate: Date;
}
