import { IsOptional } from 'class-validator';

export class BasePagination {
  @IsOptional()
  limit?: number;

  @IsOptional()
  page?: number;
}
