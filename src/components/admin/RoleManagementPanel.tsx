import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Crown, Users, Search, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserWithRole {
  id: string;
  username?: string;
  created_at: string;
  roles: Array<{
    role: string;
    granted_at: string;
    granted_by: string | null;
  }>;
}

export const RoleManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with their roles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, granted_at, granted_by');

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        ...profile,
        roles: (userRoles || [])
          .filter(ur => ur.user_id === profile.id)
          .map(ur => ({
            role: ur.role,
            granted_at: ur.granted_at,
            granted_by: ur.granted_by,
          })),
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users and roles');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'contributor' | 'free') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          granted_by: user?.id,
        });

      if (error) throw error;

      toast.success(`Role ${role} assigned successfully`);
      loadUsers();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      if (error.code === '23505') {
        toast.error('User already has this role');
      } else {
        toast.error('Failed to assign role');
      }
    }
  };

  const removeRole = async (userId: string, role: 'admin' | 'contributor' | 'free') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast.success(`Role ${role} removed successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-3 h-3" />;
      case 'contributor':
        return <UserCheck className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'contributor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || 
      u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      u.roles.some(r => r.role === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Role Management
        </h2>
        <p className="text-muted-foreground">
          Assign and manage user roles and permissions
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Role Hierarchy:</strong> Admin (full access) → Contributor (content management) → Free (basic access)
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Roles
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-3">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{user.username || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">User ID: {user.id.slice(0, 8)}</p>
                      </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline">No roles assigned</Badge>
                        ) : (
                          user.roles.map((r) => (
                            <Badge
                              key={r.role}
                              variant={getRoleBadgeVariant(r.role)}
                              className="flex items-center gap-1"
                            >
                              {getRoleIcon(r.role)}
                              {r.role}
                              <button
                                onClick={() => removeRole(user.id, r.role as 'admin' | 'contributor' | 'free')}
                                className="ml-1 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2">
                        {!user.roles.some(r => r.role === 'admin') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(user.id, 'admin')}
                          >
                            Make Admin
                          </Button>
                        )}
                        {!user.roles.some(r => r.role === 'contributor') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(user.id, 'contributor')}
                          >
                            Make Contributor
                          </Button>
                        )}
                        {!user.roles.some(r => r.role === 'free') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignRole(user.id, 'free')}
                          >
                            Make Free
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Current Roles</TableHead>
                      <TableHead>Granted At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              {user.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <span className="font-medium">{user.username || 'Anonymous'}</span>
                              <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {user.roles.length === 0 ? (
                              <Badge variant="outline">No roles</Badge>
                            ) : (
                              user.roles.map((r) => (
                                <Badge
                                  key={r.role}
                                  variant={getRoleBadgeVariant(r.role)}
                                  className="flex items-center gap-1"
                                >
                                  {getRoleIcon(r.role)}
                                  {r.role}
                                  <button
                                    onClick={() => removeRole(user.id, r.role as 'admin' | 'contributor' | 'free')}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {user.roles.length > 0 
                            ? new Date(user.roles[0].granted_at).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!user.roles.some(r => r.role === 'admin') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => assignRole(user.id, 'admin')}
                              >
                                Admin
                              </Button>
                            )}
                            {!user.roles.some(r => r.role === 'contributor') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => assignRole(user.id, 'contributor')}
                              >
                                Contributor
                              </Button>
                            )}
                            {!user.roles.some(r => r.role === 'free') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => assignRole(user.id, 'free')}
                              >
                                Free
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-semibold">Admin</h4>
                <p className="text-sm text-muted-foreground">
                  Full access to all platform features including user management, content moderation, 
                  system settings, and analytics.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <h4 className="font-semibold">Contributor</h4>
                <p className="text-sm text-muted-foreground">
                  Can create, edit, and manage content. Access to contributor dashboard and earnings tracking.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="font-semibold">Free</h4>
                <p className="text-sm text-muted-foreground">
                  Basic user access with ability to view content, comment, and interact with the platform.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
