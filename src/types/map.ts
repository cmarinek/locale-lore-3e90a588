export interface Fact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  category_id: string;
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  media_urls: string[] | null;
  author_id: string;
  verified_by: string | null;
  vote_count_up: number;
  vote_count_down: number;
  created_at: string;
  updated_at: string;
  // Relations
  categories?: {
    slug: string;
    icon: string;
    color: string;
    category_translations: {
      name: string;
      language_code: string;
    }[];
  };
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
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

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FactMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
  verified: boolean;
  voteScore: number;
  authorName?: string;
  imageUrl?: string | null;
  categoryIcon?: string;
  categoryColor?: string;
  description?: string;
}