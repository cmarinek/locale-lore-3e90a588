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
    if (!['admin', 'moderator', 'user'].includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    // First, remove existing roles for this user
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Then add the new role (map 'user' to 'free' as per schema)
    const mappedRole = role === 'user' ? 'free' : role;
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: mappedRole as 'admin' | 'contributor' | 'free' });

    if (error) throw error;
  };

  const getContentReports = async (status?: string) => {
    let query = supabase
      .from('content_reports')
      .select(`
        *,
        reporter:reporter_id(username, email),
        reviewer:reviewed_by(username, email)
      `)
      .order('created_at', { ascending: false });

    if (status && ['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const updateReportStatus = async (reportId: string, status: string, resolutionNotes?: string) => {
    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const updateData: any = { 
      status,
      reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      reviewed_at: new Date().toISOString()
    };

    if (resolutionNotes) {
      updateData.resolution_notes = resolutionNotes;
    }

    const { error } = await supabase
      .from('content_reports')
      .update(updateData)
      .eq('id', reportId);

    if (error) throw error;
  };

  const getSystemMetrics = async (timeRange = '24h') => {
    // Calculate the start time based on range
    const now = new Date();
    const startTime = new Date();
    
    switch(timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', startTime.toISOString())
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data || [];
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