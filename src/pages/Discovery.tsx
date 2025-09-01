import React, { useEffect } from 'react';
import { SearchBar } from '@/components/discovery/SearchBar';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { MainLayout } from '@/components/templates/MainLayout';
import { Compass, TrendingUp, Clock, Target } from 'lucide-react';

const Discovery: React.FC = () => {
  const { 
    filters,
    facts,
    loadCategories, 
    loadSavedFacts, 
    searchFacts 
  } = useDiscoveryStore();

  useEffect(() => {
    // Initialize data
    loadCategories();
    loadSavedFacts();
    searchFacts(true);
  }, [loadCategories, loadSavedFacts, searchFacts]);

  const getSortIcon = () => {
    switch (filters.sortBy) {
      case 'popularity': return <TrendingUp className="h-4 w-4" />;
      case 'recency': return <Clock className="h-4 w-4" />;
      case 'distance': return <Target className="h-4 w-4" />;
      case 'credibility': return <Compass className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getSortLabel = () => {
    switch (filters.sortBy) {
      case 'popularity': return 'Most Popular';
      case 'recency': return 'Most Recent';
      case 'distance': return 'Nearest';
      case 'credibility': return 'Most Credible';
      default: return 'Most Recent';
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Discover Facts</h1>
              <p className="text-muted-foreground">Explore fascinating facts from around the world</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <Card variant="glass">
          <CardContent className="p-6">
            <div className="space-y-4">
              <SearchBar />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FilterPanel />
                  
                  {filters.center && (
                    <Badge variant="chip" className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {filters.radius}km radius
                    </Badge>
                  )}
                  
                  {filters.categories.length > 0 && (
                    <Badge variant="chip">
                      {filters.categories.length} categor{filters.categories.length === 1 ? 'y' : 'ies'}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getSortIcon()}
                  <span>{getSortLabel()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {facts.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filters.query ? (
                <>Showing results for "{filters.query}"</>
              ) : (
                <>Discovered {facts.length} fascinating facts</>
              )}
            </p>
          </div>
        )}

        {/* Facts List */}
        <InfiniteFactList />

        {/* Preview Modal */}
        <FactPreviewModal />
      </div>
    </MainLayout>
  );
};

export default Discovery;