import { IsOptional, IsString } from 'class-validator';
import { BasePagination } from 'src/base/base-pagination';

export class ClassFilter extends BasePagination {
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  teacherId?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  schoolyear?: string;
}
