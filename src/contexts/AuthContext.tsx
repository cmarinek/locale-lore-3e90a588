import React, { useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Temporarily disable context to prevent bundling issues
let globalAuthState: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {}
};

export const useAuth = () => {
  return globalAuthState;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
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
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error('Sign out error:', err);
      }
      
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        globalAuthState = {
          user: session?.user ?? null,
          session,
          loading: false,
          signOut,
          refreshProfile
        };
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            refreshProfile();
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      globalAuthState = {
        user: session?.user ?? null,
        session,
        loading: false,
        signOut,
        refreshProfile
      };
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

  // Update global state
  globalAuthState = {
    user,
    session,
    loading,
    signOut,
    refreshProfile,
  };

  return <div>{children}</div>;
};

