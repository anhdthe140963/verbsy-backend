import { IPagination } from 'src/interfaces/pagination';

export interface GetUserFilter extends IPagination {
  roleId?: number;
}
