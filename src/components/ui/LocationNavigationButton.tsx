import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Navigation } from 'lucide-react';
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
  const { setMapCenter, setSyncSelectedFact } = useDiscoveryStore();

  const handleLocationClick = (e: React.MouseEvent) => {
    // Critical: Stop event propagation to prevent card click
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Location button clicked:', { latitude, longitude, locationName });
    
    const currentPath = location.pathname;
    
    // Set the map center coordinates
    console.log('Setting map center to:', [longitude, latitude]);
    setMapCenter([longitude, latitude]);
    
    // Set the selected fact for highlighting
    if (factId) {
      setSyncSelectedFact(factId);
    }
    
    if (currentPath === '/map') {
      // If already on map page, just center the map
      console.log('Already on map page, centering map');
      toast.success(`Centered map on ${locationName || 'location'}`);
    } else {
      // Navigate to map view for map centering
      console.log('Navigating to map page');
      navigate('/map', { 
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
        className={`h-9 w-9 p-0 rounded-full bg-gradient-to-br from-logo-blue to-logo-green hover:from-logo-blue-light hover:to-logo-green-light shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${className || ''}`}
        title={`Go to ${locationName || 'location'} on map`}
      >
        <Target className="h-4 w-4 text-white animate-pulse" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleLocationClick}
      className={`bg-gradient-to-r from-logo-blue to-logo-green hover:from-logo-blue-light hover:to-logo-green-light text-white border-none shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className || ''}`}
    >
      <Target className="h-4 w-4 mr-2 animate-pulse" />
      Go to Location
    </Button>
  );
};