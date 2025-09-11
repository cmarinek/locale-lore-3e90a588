import React from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

console.log('[TRACE] Creating AuthContext - React available:', !!React);
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
console.log('[TRACE] AuthContext created successfully');

export const useAuth = () => {
  console.log('[TRACE] useAuth invoked; typeof AuthContext =', typeof AuthContext);
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthSafe = () => {
  const context = React.useContext(AuthContext);
  return context;
};