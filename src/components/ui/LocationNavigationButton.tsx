import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Navigation } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useMapStore } from '@/stores/mapStore';
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
  const { setSelectedFact } = useDiscoveryStore();
  const { setCenter, setSelectedMarkerId } = useMapStore();

  const handleLocationClick = (e: React.MouseEvent) => {
    // Critical: Stop event propagation to prevent card click
    e.stopPropagation();
    e.preventDefault();

    console.log('Location button clicked:', { latitude, longitude, locationName, factId });

    const currentPath = location.pathname;

    // Build URL parameters for navigation
    const params = new URLSearchParams();
    params.set('lat', latitude.toString());
    params.set('lng', longitude.toString());
    params.set('zoom', '15');
    if (factId) {
      params.set('factId', factId);
    }

    if (currentPath === '/map') {
      // If already on map page, just update the URL params and state
      console.log('Already on map page, updating URL parameters');
      setCenter([longitude, latitude]);
      if (factId) {
        setSelectedMarkerId(factId);
      }
      navigate(`/map?${params.toString()}`, { replace: true });
      toast.success(`Centered map on ${locationName || 'location'}`);
    } else if (currentPath === '/hybrid') {
      // If on hybrid page, just center the map and switch to map tab
      console.log('On hybrid page, centering map and switching to map tab');
      setCenter([longitude, latitude]);
      if (factId) {
        setSelectedMarkerId(factId);
      }
      // Dispatch custom event to switch to map tab
      window.dispatchEvent(new CustomEvent('switch-to-map-tab'));
      toast.success(`Centered map on ${locationName || 'location'}`);
    } else {
      // Navigate to map view with URL parameters
      console.log('Navigating to map page with params:', params.toString());
      navigate(`/map?${params.toString()}`);
      toast.success(`Opening ${locationName || 'location'} on map`);
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