import { Transform, Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional } from 'class-validator';
import { BasePagination } from 'src/base/base-pagination';

export class UserPaginationFilter extends BasePagination {
  @IsOptional()
  id?: number;

  @IsOptional()
  username?: string;

  @IsOptional()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return value == 'true' || value == '1';
  })
  gender?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  role?: number;
}
