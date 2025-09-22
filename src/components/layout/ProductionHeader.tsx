import React from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ProductionHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/map':
        return 'Explore Stories';
      case '/hybrid':
        return 'Explore Stories';
      default:
        return 'LocaleLore';
    }
  };

  const showBackButton = () => {
    return !['/', '/hybrid', '/map'].includes(location.pathname);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {showBackButton() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-3 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <h1 className="text-lg font-semibold text-foreground">
          {getTitle()}
        </h1>
        
        <div className="ml-auto flex items-center space-x-2">
          {(location.pathname === '/map' || location.pathname === '/hybrid') && (
            <>
              <Button variant="ghost" size="sm" className="p-2">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};