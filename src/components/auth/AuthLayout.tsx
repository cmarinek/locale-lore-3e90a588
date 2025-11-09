import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  showBackButton?: boolean;
  showHomeLink?: boolean;
  onBack?: () => void;
}

export const AuthLayout = ({ 
  children, 
  title, 
  description, 
  showBackButton = false,
  showHomeLink = true,
  onBack 
}: AuthLayoutProps) => {
  const { branding } = useSiteSettings();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Top navigation bar */}
      {showHomeLink && (
        <header className="w-full p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover-scale">
              <img 
                src={branding?.logo_url || '/logo.png'} 
                alt={branding?.site_name || 'LocaleLore'} 
                className="h-8 object-contain" 
              />
              <span className="font-bold text-xl bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
                {branding?.site_name || 'LocaleLore'}
              </span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Link>
            </Button>
          </div>
        </header>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-card/80 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center pb-6 relative">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="absolute left-0 top-6 h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};