import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { markModule } from '@/debug/module-dupe-check';
import { AuthContextType, _setAuthContext } from './auth-context';

// Mark module load for debugging
markModule('AuthProvider-v13');
console.log('[TRACE] AuthProvider-v13 file start');

interface AuthProviderProps {
  children: React.ReactNode;
}

// Context will be created lazily inside the Provider
let ActualAuthContext: React.Context<AuthContextType | undefined> | null = null;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  console.log('[TRACE] AuthProvider component initializing');
  
  // Lazy initialization of context to avoid TDZ issues
  if (!ActualAuthContext) {
    ActualAuthContext = React.createContext<AuthContextType | undefined>(undefined);
    _setAuthContext(ActualAuthContext);
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAuthState = () => {
    // Clear all auth-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear from sessionStorage if exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Sign out error:', err);
      }
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('[TRACE] AuthProvider useEffect initializing');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Defer profile refresh to prevent deadlocks
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            refreshProfile();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(() => {
          refreshProfile();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshProfile,
  };

  console.log('[TRACE] AuthProvider rendering with value:', { hasUser: !!user, loading });

  return (
    <ActualAuthContext.Provider value={value}>
      {children}
    </ActualAuthContext.Provider>
  );
};

// Export hooks from here
export const useAuth = () => {
  if (!ActualAuthContext) {
    throw new Error('useAuth must be used within an AuthProvider - context not initialized');
  }
  
  const context = React.useContext(ActualAuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthSafe = () => {
  if (!ActualAuthContext) {
    return undefined;
  }
  
  const context = React.useContext(ActualAuthContext);
  return context;
};