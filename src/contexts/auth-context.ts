import { markModule } from '@/debug/module-dupe-check';
import type { User, Session } from '@supabase/supabase-js';

// Mark module load for debugging
markModule('AuthContext-v14');


export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Pure type exports - no React API calls during module initialization
export const AUTH_CONTEXT_NAME = 'auth-context-v14';