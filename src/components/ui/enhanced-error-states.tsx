import React from 'react';
import { Button } from './button';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Card } from './card';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  MapPin, 
  Search,
  Database,
  Clock,
  Shield
} from 'lucide-react';

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
    loading?: boolean;
  }>;
  className?: string;
  variant?: 'card' | 'alert';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  icon,
  actions,
  className,
  variant = 'card'
}) => {
  const content = (
    <div className="space-y-4">
      {icon && (
        <div className="flex justify-center text-destructive">
          {icon}
        </div>
      )}
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-destructive">{title}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      </div>
      
      {actions && actions.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap pt-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || 'outline'}
              disabled={action.loading}
              size="lg"
              className="min-h-[44px] min-w-[44px]"
            >
              {action.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 mt-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  disabled={action.loading}
                  size="sm"
                  className="min-h-[44px] min-w-[44px]"
                >
                  {action.loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={cn("p-8", className)}>
      {content}
    </Card>
  );
};

// Pre-configured error states for common scenarios
export const NetworkError: React.FC<{ onRetry: () => void; retrying?: boolean }> = ({ 
  onRetry, 
  retrying 
}) => (
  <ErrorState
    icon={<Wifi className="w-12 h-12" />}
    title="Connection Problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    actions={[
      {
        label: "Try Again",
        onClick: onRetry,
        loading: retrying,
        variant: "default"
      }
    ]}
  />
);

export const LocationError: React.FC<{ onRetry?: () => void; onSkip?: () => void }> = ({ 
  onRetry, 
  onSkip 
}) => (
  <ErrorState
    icon={<MapPin className="w-12 h-12" />}
    title="Location Access Denied"
    description="We need location access to show you nearby stories. Please enable location services or search manually."
    actions={[
      ...(onRetry ? [{
        label: "Allow Location",
        onClick: onRetry,
        variant: "default" as const
      }] : []),
      ...(onSkip ? [{
        label: "Search Manually",
        onClick: onSkip,
        variant: "outline" as const
      }] : [])
    ]}
  />
);

export const SearchError: React.FC<{ onRetry: () => void; onClear?: () => void }> = ({ 
  onRetry, 
  onClear 
}) => (
  <ErrorState
    icon={<Search className="w-12 h-12" />}
    title="Search Failed"
    description="Something went wrong while searching. Please try again or clear your search."
    actions={[
      {
        label: "Try Again",
        onClick: onRetry,
        variant: "default"
      },
      ...(onClear ? [{
        label: "Clear Search",
        onClick: onClear,
        variant: "outline" as const
      }] : [])
    ]}
  />
);

export const DatabaseError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorState
    icon={<Database className="w-12 h-12" />}
    title="Data Unavailable"
    description="We're having trouble loading the data right now. Please try again in a moment."
    actions={[
      {
        label: "Retry",
        onClick: onRetry,
        variant: "default"
      }
    ]}
  />
);

export const TimeoutError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <ErrorState
    icon={<Clock className="w-12 h-12" />}
    title="Request Timed Out"
    description="The request is taking longer than expected. Please check your connection and try again."
    actions={[
      {
        label: "Try Again",
        onClick: onRetry,
        variant: "default"
      }
    ]}
  />
);

export const PermissionError: React.FC<{ onRequestPermission?: () => void }> = ({ 
  onRequestPermission 
}) => (
  <ErrorState
    icon={<Shield className="w-12 h-12" />}
    title="Permission Required"
    description="This feature requires additional permissions to work properly."
    actions={onRequestPermission ? [
      {
        label: "Grant Permission",
        onClick: onRequestPermission,
        variant: "default"
      }
    ] : undefined}
  />
);