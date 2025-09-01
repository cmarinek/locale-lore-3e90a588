import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthLayout } from '@/components/auth/AuthLayout';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // Handle OAuth callback
          const { data: authData, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            throw authError;
          }

          if (authData.user) {
            setSuccess(true);
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            throw new Error('No session found');
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <AuthLayout
        title="Signing you in..."
        description="Please wait while we complete your authentication"
      >
        <div className="text-center space-y-6">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Completing authentication...
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout
        title="Authentication Failed"
        description="There was an issue with your authentication"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        title="Welcome!"
        description="You have been successfully signed in"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the app...
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return null;
};

export default AuthCallback;