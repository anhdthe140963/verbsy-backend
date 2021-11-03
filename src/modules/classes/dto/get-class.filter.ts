import { IPagination } from 'src/interfaces/pagination';

export interface GetClassFilter extends IPagination {
  teacherId?: number;
  grade?: string;
}
