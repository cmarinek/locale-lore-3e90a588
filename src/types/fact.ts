
export interface Fact {
  id: string;
  title: string;
  description: string;
  author_id: string;
  category_id: string;
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  vote_count_up: number;
  vote_count_down: number;
  latitude: number;
  longitude: number;
  location_name: string;
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  verified_by?: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  categories?: {
    slug: string;
    icon?: string;
    color?: string;
  };
}

export interface EnhancedFact extends Fact {
  recommendation_score?: number;
  recommendation_reason?: string;
  trending_score?: number;
}

export interface EnhancedCategory {
  id: string;
  slug: string;
  icon?: string;
  color?: string;
  category_translations?: Array<{
    name: string;
    description?: string;
    language_code: string;
  }>;
}

export interface SearchFilters {
  query: string;
  category?: string;
  verified?: boolean;
  timeRange?: string;
  sortBy: 'relevance' | 'date' | 'popularity';
  location?: { lat: number; lng: number; name?: string };
  categories?: string[];
  radius?: number;
  center?: { lat: number; lng: number };
}

export type FactStatus = 'pending' | 'verified' | 'disputed' | 'rejected';
