
// Global type definitions
export * from './auth';

// Export specific types from fact.ts to avoid conflicts with map.ts
export type { 
  Fact as FactType, 
  Category as CategoryType, 
  CategoryTranslation as CategoryTranslationType,
  UserProfile,
  Vote,
  SavedFact
} from './fact';

// Export map-specific types
export type { 
  Fact as MapFact,
  Category as MapCategory,
  CategoryTranslation as MapCategoryTranslation,
  MapBounds,
  FactMarker
} from './map';

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
