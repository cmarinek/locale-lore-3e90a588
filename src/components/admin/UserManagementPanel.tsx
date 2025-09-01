import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield, User, Crown, Users } from 'lucide-react';
import { toast } from 'sonner';

export const UserManagementPanel: React.FC = () => {
  const { getUsers, updateUserRole } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, count } = await getUsers(currentPage, 20);
      setUsers(data);
      setTotalUsers(count);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || 
      user.user_roles?.some((r: any) => r.role === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(totalUsers / 20);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-sm"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-6">
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {filteredUsers.map((user) => {
                const currentRole = user.user_roles?.[0]?.role || 'user';
                return (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.username || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                        </div>
                      </div>
                      <Badge variant={getRoleBadgeVariant(currentRole)} className="flex items-center gap-1">
                        {getRoleIcon(currentRole)}
                        <span className="text-xs">{currentRole}</span>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <div>Joined: {new Date(user.created_at).toLocaleDateString()}</div>
                      <div>Last: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</div>
                    </div>
                    <Select
                      value={currentRole}
                      onValueChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </Card>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const currentRole = user.user_roles?.[0]?.role || 'user';
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {user.username || 'Anonymous'}
                            </div>
                            <div className="text-xs text-muted-foreground md:hidden">
                              {user.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {user.email || 'No email'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(currentRole)} className="flex items-center gap-1 w-fit">
                          {getRoleIcon(currentRole)}
                          <span className="text-xs">{currentRole}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <Select
                          value={currentRole}
                          onValueChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                        >
                          <SelectTrigger className="w-28 sm:w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {currentPage * 20 + 1} to {Math.min((currentPage + 1) * 20, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex gap-2 justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};