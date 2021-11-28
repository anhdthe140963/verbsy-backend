import { IsOptional, IsString } from 'class-validator';
import { BasePagination } from 'src/base/base-pagination';

export class ClassFilter extends BasePagination {
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gradeId?: string;

  @IsOptional()
  @IsString()
  schoolYearId?: string;
}
