import { IPagination } from 'src/interfaces/pagination';

export interface GetQuestionFilter extends IPagination {
  lectureId?: number;
}
