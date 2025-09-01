
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
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  created_at: string;
  updated_at: string;
  media_urls?: string[];
  verified_by?: string;
  // Relations
  categories?: Category;
  profiles?: UserProfile;
}

export interface Category {
  id: string;
  slug: string;
  icon: string;
  color: string;
  created_at: string;
  category_translations: CategoryTranslation[];
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  description: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name?: string;
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

// Enhanced Fact type for discovery components
export interface EnhancedFact {
  id: string;
  title: string;
  description: string;
  content?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  author_id: string;
  category_id: string;
  vote_count_up: number;
  vote_count_down: number;
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  created_at: string;
  updated_at: string;
  media_urls?: string[];
  verified_by?: string;
  upvotes?: number;
  is_verified?: boolean;
  user_id?: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
    category_translations?: Array<{
      language_code: string;
      name: string;
    }>;
  };
}

// Enhanced Category type
export interface EnhancedCategory {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  category_translations?: Array<{
    language_code: string;
    name: string;
  }>;
}
