import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, ThumbsUp, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FactCard } from '@/components/discovery/FactCard';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSearch } from '@/components/ui/enhanced-loading-states';
import { EmptySearchResults } from '@/components/ui/enhanced-empty-states';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  vote_count_up: number;
  vote_count_down: number;
  status: string;
  media_urls?: string[];
  profiles: {
    username: string;
    avatar_url?: string;
  };
  categories: {
    slug: string;
    icon: string;
    color: string;
  };
  recommendation_score?: number;
  recommendation_reason?: string;
  trending_score?: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  query,
  total,
  hasMore,
  onLoadMore,
  sortBy,
  onSortChange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (loading && results.length === 0) {
    return <LoadingSearch />;
  }

  if (!loading && results.length === 0 && query) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <EmptySearchResults query={query} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="text-sm text-muted-foreground">
            {total > 0 && (
              <>
                Found <span className="font-medium text-foreground">{total}</span> results
                {query && (
                  <> for "<span className="font-medium text-foreground">{query}</span>"</>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-sm border border-border rounded px-3 py-1 bg-background"
            >
              <option value="relevance">Most Relevant</option>
              <option value="date">Newest First</option>
              <option value="votes">Most Popular</option>
              <option value="location">Nearest</option>
            </select>

            <div className="flex border border-border rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 text-xs ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 text-xs ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                List
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid/List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <FactCard fact={result as any} />
                {(result.recommendation_reason || result.trending_score) && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {result.recommendation_reason || 'Trending'}
                      {result.recommendation_score && (
                        <span className="ml-1">({Math.round(result.recommendation_score)})</span>
                      )}
                    </Badge>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {result.media_urls && result.media_urls.length > 0 && (
                      <div className="flex-shrink-0">
                        <img
                          src={result.media_urls[0]}
                          alt={result.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1 mb-2">
                            {result.title}
                          </h3>
                          <p className="text-muted-foreground line-clamp-2 mb-3">
                            {result.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {result.location_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {result.profiles.username}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm">
                              <ThumbsUp className="w-4 h-4" />
                              {result.vote_count_up}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <MessageCircle className="w-4 h-4" />
                              {/* Comment count would go here */}
                            </div>
                            
                            <Badge
                              variant="secondary"
                              className="ml-auto"
                              style={{ backgroundColor: `${result.categories.color  }20` }}
                            >
                              {result.categories.icon} {result.categories.slug}
                            </Badge>

                            {result.status === 'verified' && (
                              <Badge variant="default" className="bg-green-500/20 text-green-700">
                                Verified
                              </Badge>
                            )}
                          </div>

                          {(result.recommendation_reason || result.trending_score) && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {result.recommendation_reason || 'Trending'}
                                {result.recommendation_score && (
                                  <span className="ml-1">({Math.round(result.recommendation_score)})</span>
                                )}
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-6"
        >
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </Button>
        </motion.div>
      )}

      {/* No More Results */}
      {!hasMore && results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-muted-foreground text-sm"
        >
          That's all the results for your search
        </motion.div>
      )}
    </div>
  );
};