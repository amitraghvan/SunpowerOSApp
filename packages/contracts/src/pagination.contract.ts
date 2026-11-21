import { PaginatedResult } from '@solaros/types';

export interface PaginationQueryDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class PaginatedResponse<T> implements PaginatedResult<T> {
  data: T[] = [];
  total: number = 0;
  page: number = 1;
  limit: number = 20;
  totalPages: number = 0;

  constructor(partial: Partial<PaginatedResponse<T>>) {
    Object.assign(this, partial);
  }
}
