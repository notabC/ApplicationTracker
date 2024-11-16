// src/core/api/types/requests.ts
export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  