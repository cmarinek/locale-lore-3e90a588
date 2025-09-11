import React from 'react';
import { markModule } from '@/debug/module-dupe-check';
import type { User, Session } from '@supabase/supabase-js';

// Mark module load for debugging
markModule('AuthContext-v12');
console.log('[TRACE] AuthContext-v12 file start');

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create a placeholder that will be replaced by the actual context
export let AuthContext: React.Context<AuthContextType | undefined> = null as any;

// This will be called by the provider to set the actual context
export const _setAuthContext = (context: React.Context<AuthContextType | undefined>) => {
  AuthContext = context;
};