
export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: UserProfile;
  following?: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: 'fact_created' | 'fact_voted' | 'comment_created' | 'user_followed' | 'achievement_earned';
  related_fact_id?: string;
  related_user_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  profiles?: UserProfile;
  facts?: {
    title: string;
    location_name: string;
  };
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'location';
  read_at?: string;
  created_at: string;
  sender?: UserProfile;
  recipient?: UserProfile;
}

export interface MessageThread {
  id: string;
  participants: UserProfile[];
  last_message?: DirectMessage;
  unread_count: number;
  updated_at: string;
}

export interface SocialShareOptions {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'native';
  content: {
    text: string;
    url: string;
    image?: string;
  };
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'followers' | 'private';
  activity_visibility: 'public' | 'followers' | 'private';
  location_sharing: boolean;
  direct_messages: 'everyone' | 'followers' | 'none';
  mention_notifications: boolean;
  follower_notifications: boolean;
}
