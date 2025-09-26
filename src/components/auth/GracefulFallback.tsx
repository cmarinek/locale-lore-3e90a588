import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, ArrowRight, Star, Shield } from 'lucide-react';

interface GracefulFallbackProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  contributorOnly?: boolean;
  adminOnly?: boolean;
  feature?: string;
  previewMode?: boolean;
  fallbackContent?: React.ReactNode;
}

export const GracefulFallback: React.FC<GracefulFallbackProps> = ({
  children,
  requiresAuth = false,
  contributorOnly = false,
  adminOnly = false,
  feature = "feature",
  previewMode = true,
  fallbackContent
}) => {
  const { role, isAdmin, isContributor, isAuthenticated } = useUserRole();
  const location = useLocation();

  // Admin-only features - hard block with contact info
  if (adminOnly && !isAdmin) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Admin Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                This feature requires administrator privileges.
              </p>
              <Button asChild>
                <Link to="/support">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  // Show auth prompt for unauthenticated users
  if (requiresAuth && !isAuthenticated) {
    return (
      <div className="relative min-h-[400px]">
        {/* Blurred background preview */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blur-sm opacity-30 pointer-events-none scale-105">
            {previewMode ? children : (fallbackContent || <div className="bg-gradient-to-br from-primary/20 to-secondary/20 h-full rounded-lg" />)}
          </div>
        </div>
        
        {/* Conversion overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle className="text-xl">Join to Unlock {feature}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Create a free account to access this feature and discover amazing local stories.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth" state={{ from: location, mode: 'signup' }}>
                    <Star className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth" state={{ from: location, mode: 'login' }}>
                    Already have an account? Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show upgrade prompt for contributor features
  if (contributorOnly && !isContributor) {
    return (
      <div className="relative min-h-[400px]">
        {/* Blurred background preview */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blur-sm opacity-40 pointer-events-none scale-105">
            {previewMode ? children : (fallbackContent || <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 h-full rounded-lg" />)}
          </div>
        </div>
        
        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-yellow-400/30 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50">
            <CardHeader className="text-center">
              <Crown className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
              <Badge className="mx-auto mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Premium Feature
              </Badge>
              <CardTitle className="text-xl">Unlock Creator Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                This {feature} is available to contributors. Upgrade to access premium features and earn from your content.
              </p>
              
              {/* Feature preview/benefits */}
              <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
                <h4 className="font-semibold text-sm">✨ Premium includes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Advanced submission tools</li>
                  <li>• Revenue sharing</li>
                  <li>• Priority support</li>
                  <li>• Exclusive creator features</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600" size="lg">
                  <Link to="/contributor">
                    <Crown className="w-4 h-4 mr-2" />
                    Become a Contributor
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/billing">
                    View All Plans
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User has access - render normally
  return <>{children}</>;
};