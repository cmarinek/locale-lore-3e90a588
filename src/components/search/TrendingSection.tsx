import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, MapPin, Calendar, Eye, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface TrendingFact {
  id: string;
  score: number;
  view_count: number;
  vote_count: number;
  comment_count: number;
  facts: {
    id: string;
    title: string;
    description: string;
    location_name: string;
    created_at: string;
    vote_count_up: number;
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
  };
}

interface TrendingLocation {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  fact_count: number;
  score: number;
}

interface TrendingSectionProps {
  onLocationClick?: (location: { name: string; lat: number; lng: number }) => void;
  onFactClick?: (factId: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  onLocationClick,
  onFactClick
}) => {
  const [trendingFacts, setTrendingFacts] = useState<TrendingFact[]>([]);
  const [trendingLocations, setTrendingLocations] = useState<TrendingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'facts' | 'locations'>('facts');

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      setLoading(true);

      // Load trending facts
      const { data: factsData } = await supabase
        .from('trending_facts')
        .select(`
          *,
          facts!trending_facts_fact_id_fkey(
            *,
            profiles!facts_author_id_fkey(username, avatar_url),
            categories!facts_category_id_fkey(slug, icon, color)
          )
        `)
        .gte('period_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('score', { ascending: false })
        .limit(10);

      // Load trending locations
      const { data: locationsData } = await supabase
        .from('trending_locations')
        .select('*')
        .gte('period_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('score', { ascending: false })
        .limit(10);

      setTrendingFacts((factsData as any) || []);
      setTrendingLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Trending Now</h3>
          </div>
          
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-3 py-1 text-sm transition-colors ${
                activeTab === 'facts'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Facts
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1 text-sm transition-colors ${
                activeTab === 'locations'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              Places
            </button>
          </div>
        </div>

        {/* Trending Facts */}
        {activeTab === 'facts' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {trendingFacts.length > 0 ? (
              trendingFacts.map((trending, index) => (
                <motion.div
                  key={trending.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onFactClick?.(trending.facts.id)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    #{index + 1}
                  </div>
                  
                  {trending.facts.media_urls && trending.facts.media_urls.length > 0 && (
                    <div className="flex-shrink-0">
                      <img
                        src={trending.facts.media_urls[0]}
                        alt={trending.facts.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium line-clamp-1 mb-1">
                      {trending.facts.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {trending.facts.description}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trending.facts.location_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {trending.view_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {trending.facts.vote_count_up}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {trending.comment_count}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant="secondary"
                      style={{ backgroundColor: `${trending.facts.categories.color  }20` }}
                    >
                      {trending.facts.categories.icon}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Score: {Math.round(trending.score)}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No trending facts yet</p>
                <p className="text-xs">Check back later for popular content</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Trending Locations */}
        {activeTab === 'locations' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {trendingLocations.length > 0 ? (
              trendingLocations.map((location, index) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onLocationClick?.({
                    name: location.location_name,
                    lat: Number(location.latitude),
                    lng: Number(location.longitude)
                  })}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center text-secondary-foreground font-bold text-sm">
                    #{index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium mb-1">{location.location_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{location.fact_count} fact{location.fact_count !== 1 ? 's' : ''}</span>
                      <span>Score: {Math.round(location.score)}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No trending locations yet</p>
                <p className="text-xs">Popular places will appear here</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Refresh Button */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTrendingData}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Refreshing...' : 'Refresh Trending'}
          </Button>
        </div>
      </div>
    </Card>
  );
};