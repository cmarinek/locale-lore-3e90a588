import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUser {
  id: string;
  email?: string;
  username?: string;
  created_at: string;
  role?: string;
  last_sign_in_at?: string;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reported_content_type: string;
  reported_content_id: string;
  reason: string;
  description?: string;
  status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  created_at: string;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  metadata: any;
  recorded_at: string;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user has admin role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasAdminRole = userRoles?.some(r => r.role === 'admin');
      setIsAdmin(hasAdminRole || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async (page = 0, limit = 20) => {
    const { data, error, count } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (role)
      `, { count: 'exact' })
      .range(page * limit, (page + 1) * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  };

  const updateUserRole = async (userId: string, role: string) => {
    // For now, just log the action since the user_roles table might not be available yet
    console.log('Update user role:', userId, role);
    // The actual implementation would depend on the available tables
    // This is a placeholder until the schema is properly set up
  };

  const getContentReports = async (status?: string) => {
    // Mock data for demonstration since content_reports table is not in current schema
    return [
      {
        id: '1',
        reporter_id: 'user1',
        reported_content_type: 'fact',
        reported_content_id: 'fact1',
        reason: 'spam',
        description: 'This content appears to be spam',
        status: 'pending',
        created_at: new Date().toISOString(),
        reporter: { username: 'reporter1', email: 'reporter@example.com' }
      }
    ];
  };

  const updateReportStatus = async (reportId: string, status: string, resolutionNotes?: string) => {
    // Placeholder implementation
    console.log('Update report status:', reportId, status, resolutionNotes);
  };

  const getSystemMetrics = async (timeRange = '24h') => {
    // Mock metrics data for demonstration
    return [
      {
        id: '1',
        metric_name: 'active_users',
        metric_value: 156,
        metric_unit: 'count',
        metadata: {},
        recorded_at: new Date().toISOString()
      }
    ];
  };

  const getFactsForModeration = async (status?: string) => {
    let query = supabase
      .from('facts')
      .select(`
        *,
        categories (name),
        profiles:author_id (username)
      `)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'verified', 'disputed', 'rejected'].includes(status)) {
      query = query.eq('status', status as 'pending' | 'verified' | 'disputed' | 'rejected');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const updateFactStatus = async (factId: string, status: string) => {
    const validStatuses = ['pending', 'verified', 'disputed', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const { error } = await supabase
      .from('facts')
      .update({ 
        status: status as 'pending' | 'verified' | 'disputed' | 'rejected',
        verified_by: status === 'verified' ? (await supabase.auth.getUser()).data.user?.id : null
      })
      .eq('id', factId);

    if (error) throw error;
  };

  const bulkUpdateFactStatus = async (factIds: string[], status: string) => {
    const validStatuses = ['pending', 'verified', 'disputed', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const { error } = await supabase
      .from('facts')
      .update({ 
        status: status as 'pending' | 'verified' | 'disputed' | 'rejected',
        verified_by: status === 'verified' ? (await supabase.auth.getUser()).data.user?.id : null
      })
      .in('id', factIds);

    if (error) throw error;
  };

  return {
    isAdmin,
    loading,
    checkAdminStatus,
    getUsers,
    updateUserRole,
    getContentReports,
    updateReportStatus,
    getSystemMetrics,
    getFactsForModeration,
    updateFactStatus,
    bulkUpdateFactStatus
  };
};