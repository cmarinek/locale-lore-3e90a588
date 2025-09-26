import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';

export type UserRole = 'guest' | 'free' | 'contributor' | 'admin';

interface UserRoleData {
  role: UserRole;
  isAdmin: boolean;
  isContributor: boolean;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useUserRole = (): UserRoleData => {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (authLoading) return;
      
      if (!user) {
        setRole('guest');
        setLoading(false);
        return;
      }

      try {
        // Check user roles from database
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        // Determine highest priority role
        if (userRoles?.some(r => r.role === 'admin')) {
          setRole('admin');
        } else if (userRoles?.some(r => r.role === 'contributor')) {
          setRole('contributor');
        } else if (userRoles?.some(r => r.role === 'free')) {
          setRole('free');
        } else {
          // Default to free for authenticated users without explicit role
          setRole('free');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('free'); // Default to free on error for authenticated users
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, authLoading]);

  return {
    role,
    isAdmin: role === 'admin',
    isContributor: role === 'contributor' || role === 'admin',
    isAuthenticated: role !== 'guest',
    loading: loading || authLoading,
  };
};