// src/core/api/types/responses.ts
export interface ApiError {
    message: string;
    code: string;
    details?: unknown;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }