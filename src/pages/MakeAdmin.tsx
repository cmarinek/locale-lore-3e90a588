import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const MakeAdmin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const checkCurrentRole = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking role:', error);
        return;
      }
      
      setCurrentRole(data?.role || 'none');
    } catch (error) {
      console.error('Error checking role:', error);
    }
  };

  React.useEffect(() => {
    checkCurrentRole();
  }, [user]);

  const makeAdmin = async () => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already admin",
            description: "This user already has admin role",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Admin role assigned successfully. Redirecting...",
        });
        
        // Invalidate role cache and redirect
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      }
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin role. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Make Admin | Setup</title>
        </Helmet>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>Go to Sign In</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Make Admin | Setup</title>
      </Helmet>
      <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Admin Role Assignment</CardTitle>
            <CardDescription>Assign admin role to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Your User ID:</strong>
              </p>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {user.id}
              </p>
            </div>

            {currentRole && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Current Role:</strong>
                </p>
                <p className="font-semibold">
                  {currentRole === 'none' ? 'No role assigned' : currentRole}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong>
              </p>
              <p className="text-sm">{user.email}</p>
            </div>

            <Button 
              onClick={makeAdmin} 
              disabled={loading || currentRole === 'admin'}
              className="w-full"
            >
              {loading ? 'Assigning...' : currentRole === 'admin' ? 'Already Admin' : 'Make Me Admin'}
            </Button>

            {currentRole === 'admin' && (
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="w-full"
              >
                Go to Admin Dashboard
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Note: This will assign the admin role to your current account. 
              Make sure you're signed in with the correct account.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MakeAdmin;
