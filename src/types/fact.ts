
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

export interface Category {
  id: string;
  slug: string;
  icon?: string;
  color?: string;
  name: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  description?: string;
}

export interface EnhancedCategory {
  id: string;
  slug: string;
  icon?: string;
  color?: string;
  name: string;
  category_translations?: Array<{
    name: string;
    description?: string;
    language_code: string;
  }>;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  email?: string;
  created_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  fact_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface SavedFact {
  id: string;
  user_id: string;
  fact_id: string;
  created_at: string;
}

export interface SearchFilters {
  query: string;
  search?: string;
  category?: string;
  categories?: string[];
  verified?: boolean;
  timeRange?: string;
  sortBy: 'relevance' | 'date' | 'popularity' | 'recency';
  location?: { lat: number; lng: number; name?: string };
  radius?: number;
  center?: [number, number] | null;
}

export type FactStatus = 'pending' | 'verified' | 'disputed' | 'rejected';
