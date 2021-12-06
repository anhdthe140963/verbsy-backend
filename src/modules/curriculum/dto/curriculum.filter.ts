import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BasePagination } from 'src/base/base-pagination';

export class CurriculumFilter extends BasePagination {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsOptional()
  gradeId?: number;

  @IsNotEmpty()
  @IsOptional()
  classId?: number;
}
