import React from 'react';
import { Button } from './button';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { 
  Search, 
  MapPin, 
  BookOpen, 
  Camera, 
  Users, 
  Compass,
  PlusCircle,
  RefreshCw
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  suggestions?: string[];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  suggestions,
  className
}) => {
  return (
    <Card className={cn("p-8 text-center", className)}>
      <div className="space-y-4">
        {icon && (
          <div className="flex justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        
        {suggestions && suggestions.length > 0 && (
          <div className="space-y-2 text-sm text-muted-foreground">
            {suggestions.map((suggestion, index) => (
              <p key={index}>• {suggestion}</p>
            ))}
          </div>
        )}
        
        {action && (
          <div className="pt-2">
            <Button 
              onClick={action.onClick} 
              variant={action.variant || 'default'}
              size="lg"
              className="min-h-[44px] min-w-[44px]"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// Pre-configured empty states for common scenarios
export const EmptySearchResults: React.FC<{ query?: string; onClear?: () => void }> = ({ 
  query, 
  onClear 
}) => (
  <EmptyState
    icon={<Search className="w-12 h-12" />}
    title="No results found"
    description={query ? `No stories found for "${query}"` : "Try searching for something else"}
    suggestions={[
      "Check your spelling",
      "Try more general terms", 
      "Remove some filters",
      "Search for nearby locations"
    ]}
    action={onClear ? {
      label: "Clear Search",
      onClick: onClear,
      variant: "outline"
    } : undefined}
  />
);

export const EmptyFactsList: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    icon={<BookOpen className="w-12 h-12" />}
    title="No stories yet"
    description="Be the first to discover and share stories in this area"
    action={onRefresh ? {
      label: "Refresh",
      onClick: onRefresh,
      variant: "outline"
    } : undefined}
  />
);

export const EmptyStoriesFeed: React.FC<{ onCreateStory?: () => void }> = ({ onCreateStory }) => (
  <EmptyState
    icon={<Camera className="w-12 h-12" />}
    title="No stories to explore"
    description="Start creating and sharing your own stories with the community"
    action={onCreateStory ? {
      label: "Create Your First Story",
      onClick: onCreateStory
    } : undefined}
  />
);

export const EmptyMap: React.FC<{ onExplore?: () => void }> = ({ onExplore }) => (
  <EmptyState
    icon={<MapPin className="w-12 h-12" />}
    title="No locations found"
    description="Try zooming out or searching for a different area"
    action={onExplore ? {
      label: "Explore Nearby",
      onClick: onExplore,
      variant: "outline"
    } : undefined}
  />
);

export const EmptyProfile: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => (
  <EmptyState
    icon={<Users className="w-12 h-12" />}
    title="Complete your profile"
    description="Add some information about yourself to connect with other storytellers"
    action={onGetStarted ? {
      label: "Get Started",
      onClick: onGetStarted
    } : undefined}
  />
);

export const EmptyExplore: React.FC<{ onDiscover?: () => void }> = ({ onDiscover }) => (
  <EmptyState
    icon={<Compass className="w-12 h-12" />}
    title="Ready to explore?"
    description="Discover fascinating stories and local lore from around the world"
    action={onDiscover ? {
      label: "Start Exploring",
      onClick: onDiscover
    } : undefined}
  />
);