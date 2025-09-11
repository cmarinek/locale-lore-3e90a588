import { Button } from '@/components/ui/button';
import { Navigation, Loader2 } from 'lucide-react';
import { useLocationSorting } from '@/hooks/useLocationSorting';

interface DistanceSortButtonProps {
  facts: any[];
  onSorted: (sortedFacts: any[]) => void;
  disabled?: boolean;
}

export const DistanceSortButton = ({ facts, onSorted, disabled }: DistanceSortButtonProps) => {
  const { sortFactsByDistance, isLoadingLocation, lastSortedBy } = useLocationSorting();

  const handleSortByDistance = async () => {
    try {
      const sortedFacts = await sortFactsByDistance(facts);
      onSorted(sortedFacts);
    } catch (error) {
      console.error('Failed to sort by distance:', error);
    }
  };

  return (
    <Button
      variant={lastSortedBy === 'distance' ? 'default' : 'outline'}
      size="sm"
      onClick={handleSortByDistance}
      disabled={disabled || isLoadingLocation}
      className="gap-2"
    >
      {isLoadingLocation ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Navigation className="h-4 w-4" />
      )}
      {isLoadingLocation ? 'Getting location...' : 'Near me'}
    </Button>
  );
};