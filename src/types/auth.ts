
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  username?: string;
  role?: 'user' | 'admin' | 'moderator';
  created_at: string;
  last_sign_in_at?: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  name: string;
}
