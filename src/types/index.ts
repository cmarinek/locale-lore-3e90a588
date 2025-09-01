// Global type definitions
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Fact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  author_id: string;
  category_id: string;
  vote_count_up: number;
  vote_count_down: number;
  status: string;
  created_at: string;
  updated_at: string;
  media_urls?: string[];
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