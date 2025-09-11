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

// Lazy context creation to avoid TDZ issues
let _authContext: React.Context<AuthContextType | undefined> | null = null;

function getAuthContext() {
  if (!_authContext) {
    console.log('[TRACE] Creating AuthContext lazily');
    _authContext = React.createContext<AuthContextType | undefined>(undefined);
  }
  return _authContext;
}

export const AuthContext = new Proxy({} as React.Context<AuthContextType | undefined>, {
  get(target, prop) {
    return getAuthContext()[prop as keyof React.Context<AuthContextType | undefined>];
  }
});

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