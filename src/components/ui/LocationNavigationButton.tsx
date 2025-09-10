import React from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
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
  factId?: string; // For highlighting the fact card
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
  const { setMapCenter, setHighlightedFactId } = useDiscoveryStore();

  const handleLocationClick = (e: React.MouseEvent) => {
    // Critical: Stop event propagation to prevent card click
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Location button clicked:', { latitude, longitude, locationName });
    
    const currentPath = location.pathname;
    
    // Set the map center coordinates and highlight the fact
    console.log('Setting map center to:', [longitude, latitude]);
    setMapCenter([longitude, latitude]);
    if (factId) {
      setHighlightedFactId(factId);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedFactId(null), 3000);
    }
    
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
        className={`h-10 w-10 p-0 rounded-full gradient-logo hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:scale-105 border border-white/20 ${className || ''}`}
        title={`Go to ${locationName || 'location'} on map`}
      >
        <Navigation className="h-5 w-5 text-white drop-shadow-sm" />
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