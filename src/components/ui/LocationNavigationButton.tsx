import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { toast } from 'sonner';

interface LocationNavigationButtonProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  variant?: 'icon' | 'button';
  size?: 'sm' | 'default';
  className?: string;
  factId?: string;
}

export const LocationNavigationButton: React.FC<LocationNavigationButtonProps> = ({
  latitude,
  longitude,
  locationName,
  variant = 'icon',
  size = 'sm',
  className,
  factId
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setMapCenter } = useDiscoveryStore();

  const handleLocationClick = (e: React.MouseEvent) => {
    // Critical: Stop event propagation to prevent card click
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Location button clicked:', { latitude, longitude, locationName });
    
    const currentPath = location.pathname;
    
    // Set the map center coordinates with fact ID for highlighting
    console.log('Setting map center to:', [longitude, latitude]);
    setMapCenter([longitude, latitude], factId);
    
    if (currentPath === '/hybrid') {
      // If already on hybrid page, just center the map
      console.log('Already on hybrid page, centering map');
      toast.success(`Centered map on ${locationName || 'location'}`);
    } else {
      // Navigate to hybrid view for map centering
      console.log('Navigating to hybrid page');
      navigate('/hybrid', { 
        state: { centerMap: [longitude, latitude], locationName } 
      });
      toast.success(`Navigating to map view`);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLocationClick}
        className={`h-9 w-9 p-0 rounded-full gradient-logo border-2 border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ${className || ''}`}
        title={`Go to ${locationName || 'location'} on map`}
      >
        <Navigation2 className="h-4 w-4 text-white" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleLocationClick}
      className={`gradient-logo text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${className || ''}`}
    >
      <Navigation2 className="h-4 w-4 mr-2" />
      Go to Map
    </Button>
  );
};