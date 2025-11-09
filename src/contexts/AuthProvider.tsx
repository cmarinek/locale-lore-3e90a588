import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { setUserContext, clearUserContext } from '@/utils/monitoring';
import { logger } from '@/utils/logger';
import { setDebugMode } from '@/lib/debug';
import { clearRoleCache, roleQueryKeys } from '@/lib/rbac';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderComponent({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const signOut = async () => {
    try {
      // Clear role cache before signing out
      clearRoleCache(queryClient);
      await supabase.auth.signOut();
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
    let mounted = true;
    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthProvider] Loading timeout - proceeding without authentication');
        setLoading(false);
      }
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          clearTimeout(loadingTimeout);
          logger.info('Auth state changed', { component: 'AuthProvider', event });
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Update Sentry user context
          if (session?.user) {
            setUserContext(session.user.id, session.user.email);
            
            // Invalidate role cache to fetch fresh role data
            queryClient.invalidateQueries({
              queryKey: roleQueryKeys.user(session.user.id),
            });
            
            // Check if user is admin and enable debug mode
            setTimeout(() => {
              supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', session.user.id)
                .then(({ data }) => {
                  const isAdmin = data?.some(r => r.role === 'admin') || false;
                  setDebugMode(isAdmin);
                });
            }, 0);
          } else {
            clearUserContext();
            setDebugMode(false);
            // Clear role cache on logout
            clearRoleCache(queryClient);
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        clearTimeout(loadingTimeout);
        console.log('[AuthProvider] Session loaded');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch((error) => {
      if (mounted) {
        console.error('[AuthProvider] Error getting session:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthProvider = AuthProviderComponent;

// Export hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthSafe = () => {
  return useContext(AuthContext);
};