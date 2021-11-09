import { IPagination } from 'src/interfaces/pagination';

export interface GetLecturesFilter extends IPagination {
  ownerId?: number;
  lessonId?: number;
}
