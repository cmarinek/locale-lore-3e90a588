import React, { Suspense, lazy, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useDiscoveryStore } from '@/stores/discoveryStore';

// Lazy load map components for better code splitting
const MapCore = lazy(() => import('./MapCore'));
const MapMarkers = lazy(() => import('./MapMarkers'));
const MapControls = lazy(() => import('./MapControls'));

interface ExperimentalMapSystemProps {
  onFactClick?: (fact: any) => void;
  className?: string;
  isVisible?: boolean;
}

const MapErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
    <div className="text-center p-6">
      <h3 className="font-semibold text-lg mb-2">Map Error</h3>
      <p className="text-muted-foreground mb-4">Something went wrong loading the map</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  </div>
);

const MapSuspenseFallback = () => (
  <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
    <div className="animate-pulse">
      <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping"></div>
    </div>
  </div>
);

export const ExperimentalMapSystem: React.FC<ExperimentalMapSystemProps> = ({
  onFactClick,
  className = "",
  isVisible = true
}) => {
  const { facts, isLoading } = useDiscoveryStore();

  // Convert EnhancedFacts to FactMarkers for compatibility
  const factMarkers = useMemo(() => 
    facts.map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.category_translations?.[0]?.name || 'unknown',
      verified: fact.status === 'verified',
      voteScore: fact.vote_count_up - fact.vote_count_down,
      authorName: fact.profiles?.username
    })), [facts]);

  // Memoize map props to prevent unnecessary re-renders
  const mapProps = useMemo(() => ({
    onFactClick,
    facts: factMarkers,
    isLoading,
    isVisible
  }), [onFactClick, factMarkers, isLoading, isVisible]);

  if (!isVisible) {
    return <div className={className} />;
  }

  return (
    <ErrorBoundary FallbackComponent={MapErrorFallback}>
      <div className={`relative ${className}`}>
        <Suspense fallback={<MapSuspenseFallback />}>
          <MapCore {...mapProps} />
        </Suspense>
        
        <Suspense fallback={null}>
          <MapMarkers {...mapProps} />
        </Suspense>
        
        <Suspense fallback={null}>
          <MapControls {...mapProps} />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default ExperimentalMapSystem;