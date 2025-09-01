import React, { useState } from 'react';
import { useOfflineSearch } from '@/hooks/useOfflineSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Calendar, Star } from 'lucide-react';
import { FactType } from '@/types';

export const OfflineSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const { 
    isOnline, 
    searchResults, 
    searchOffline, 
    getFeaturedOfflineFacts, 
    getRecentOfflineFacts 
  } = useOfflineSearch();

  const handleSearch = (value: string) => {
    setQuery(value);
    searchOffline(value);
  };

  const featuredFacts = getFeaturedOfflineFacts();
  const recentFacts = getRecentOfflineFacts();

  const FactCard: React.FC<{ fact: FactType }> = ({ fact }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
            {fact.title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {fact.vote_count_up || 0} ↑
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {fact.description}
        </p>
        
        <div className="flex items-center text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1" />
          {fact.location_name}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Search className="w-5 h-5 mr-2" />
            {isOnline ? 'Search' : 'Offline Search'}
          </CardTitle>
          {!isOnline && (
            <p className="text-sm text-muted-foreground">
              Searching through your cached facts
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search cached facts..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      {query ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 ? (
            searchResults.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No cached facts match your search
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {featuredFacts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Featured (Cached)
              </h2>
              {featuredFacts.slice(0, 5).map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </div>
          )}

          {recentFacts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent (Cached)
              </h2>
              {recentFacts.slice(0, 5).map((fact) => (
                <FactCard key={fact.id} fact={fact} />
              ))}
            </div>
          )}

          {featuredFacts.length === 0 && recentFacts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No cached facts available. Browse online to cache facts for offline viewing.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
