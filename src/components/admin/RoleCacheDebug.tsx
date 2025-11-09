import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthProvider';
import { useUserRole, useRoleCache, roleQueryKeys } from '@/lib/rbac';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const RoleCacheDebug: React.FC = () => {
  const { user } = useAuth();
  const role = useUserRole();
  const roleCache = useRoleCache();
  const queryClient = useQueryClient();

  const handleInvalidate = async () => {
    if (user?.id) {
      await roleCache.invalidateUserRole(user.id);
      toast.success('Role cache invalidated');
    }
  };

  const handleRefetch = async () => {
    if (user?.id) {
      await roleCache.refetchUserRole(user.id);
      toast.success('Role refetched from database');
    }
  };

  const handleClearAll = async () => {
    await roleCache.invalidateAllRoles();
    toast.success('All role caches cleared');
  };

  const getCacheState = () => {
    if (!user?.id) return null;
    const queryState = queryClient.getQueryState(roleQueryKeys.user(user.id));
    return queryState;
  };

  const cacheState = getCacheState();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Role Cache Debug
          <Badge variant="outline">{role}</Badge>
        </CardTitle>
        <CardDescription>
          Monitor and manage role caching behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">User ID:</span>
            <span className="text-muted-foreground">{user?.id || 'None'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Role:</span>
            <Badge>{role}</Badge>
          </div>
          {cacheState && (
            <>
              <div className="flex justify-between">
                <span className="font-medium">Cache Status:</span>
                <Badge variant={cacheState.status === 'success' ? 'default' : 'secondary'}>
                  {cacheState.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Last Updated:</span>
                <span className="text-muted-foreground">
                  {cacheState.dataUpdatedAt 
                    ? new Date(cacheState.dataUpdatedAt).toLocaleTimeString() 
                    : 'Never'}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInvalidate}
            variant="outline"
            size="sm"
            disabled={!user}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Invalidate
          </Button>
          <Button
            onClick={handleRefetch}
            variant="outline"
            size="sm"
            disabled={!user}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refetch
          </Button>
          <Button
            onClick={handleClearAll}
            variant="destructive"
            size="sm"
            disabled={!user}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• <strong>Invalidate:</strong> Marks cache as stale, refetches on next access</p>
          <p>• <strong>Refetch:</strong> Immediately fetches fresh data from database</p>
          <p>• <strong>Clear All:</strong> Removes all role caches from memory</p>
          <p>• Cache automatically expires after 5 minutes</p>
        </div>
      </CardContent>
    </Card>
  );
};
