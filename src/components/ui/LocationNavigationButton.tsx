import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
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
}

export const LocationNavigationButton: React.FC<LocationNavigationButtonProps> = ({
  latitude,
  longitude,
  locationName,
  variant = 'icon',
  size = 'sm',
  className
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
    
    // Set the map center coordinates
    console.log('Setting map center to:', [longitude, latitude]);
    setMapCenter([longitude, latitude]);
    
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
        className={`h-9 w-9 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors ${className || ''}`}
        title={`View ${locationName || 'location'} on map`}
      >
        <MapPin className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleLocationClick}
      className={className}
    >
      <Navigation className="h-4 w-4 mr-2" />
      View on Map
    </Button>
  );
};