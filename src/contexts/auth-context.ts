import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import type { User, Session } from '@supabase/supabase-js';

// Mark module load for debugging
markModule('AuthContext-v6');
console.log('[TRACE] AuthContext-v6 file start');

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

console.log('[TRACE] Before createContext in AuthContext');
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
console.log('[TRACE] After createContext in AuthContext');

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