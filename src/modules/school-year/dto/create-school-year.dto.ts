import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolYearDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
