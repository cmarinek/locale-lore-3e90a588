
export interface Story {
  id: string;
  user_id: string;
  title: string;
  content: string;
  media_urls: string[];
  media_type: 'image' | 'video' | 'carousel';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  hashtags: string[];
  expires_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_trending: boolean;
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface StoryResponse {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  media_type: 'image' | 'video';
  created_at: string;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export interface StoryInteraction {
  id: string;
  story_id: string;
  user_id: string;
  type: 'like' | 'view' | 'share';
  created_at: string;
}

export interface QuickCaptureData {
  media: File;
  mediaType: 'image' | 'video';
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  caption: string;
  hashtags: string[];
}
