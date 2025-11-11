import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getPageName = (path: string): string => {
    const names: Record<string, string> = {
      'explore': 'Explore',
      'map': 'Map',
      'hybrid': 'Hybrid View',
      'profile': 'Profile',
      'settings': 'Settings',
      'terms': 'Terms of Service',
      'privacy': 'Privacy Policy',
      'refund': 'Refund Policy',
    };
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-2 text-sm", className)}>
      <Link 
        to="/" 
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            {isLast ? (
              <span className="text-foreground font-medium" aria-current="page">
                {getPageName(path)}
              </span>
            ) : (
              <Link 
                to={routeTo}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {getPageName(path)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
