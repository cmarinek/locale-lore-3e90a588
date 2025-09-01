// Global type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}