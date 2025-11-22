import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Tag as TagIcon, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface RelatedFact {
  id: string;
  title: string;
  location_name: string;
  categories: {
    icon: string;
    slug: string;
  };
  status: string;
  vote_count_up: number;
  distance?: number;
}

interface RelatedFactsProps {
  factId: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  tags?: string[];
}

export const RelatedFacts: React.FC<RelatedFactsProps> = ({
  factId,
  latitude,
  longitude,
  categoryId,
  tags = []
}) => {
  const navigate = useNavigate();
  const [nearbyFacts, setNearbyFacts] = useState<RelatedFact[]>([]);
  const [categoryFacts, setCategoryFacts] = useState<RelatedFact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedFacts();
  }, [factId]);

  const loadRelatedFacts = async () => {
    try {
      setLoading(true);

      // Load nearby facts (within 5km)
      const { data: nearby } = await supabase.rpc('facts_within_radius', {
        lat: latitude,
        lng: longitude,
        radius_meters: 5000,
        max_results: 5
      });

      if (nearby) {
        setNearbyFacts(nearby.filter((f: any) => f.id !== factId).slice(0, 3));
      }

      // Load same category facts
      const { data: sameCat } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          location_name,
          status,
          vote_count_up,
          categories!inner(icon, slug)
        `)
        .eq('category_id', categoryId)
        .eq('status', 'verified')
        .neq('id', factId)
        .order('vote_count_up', { ascending: false })
        .limit(3);

      if (sameCat) {
        setCategoryFacts(sameCat);
      }
    } catch (error) {
      console.error('Error loading related facts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur">
        <h3 className="font-semibold mb-4">Related Facts</h3>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  const hasRelatedFacts = nearbyFacts.length > 0 || categoryFacts.length > 0;

  if (!hasRelatedFacts) {
    return null;
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur">
      <h3 className="font-semibold mb-4">Related Facts</h3>

      {/* Nearby Facts */}
      {nearbyFacts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Nearby</span>
          </div>
          <div className="space-y-2">
            {nearbyFacts.map((fact, index) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/fact/${fact.id}`)}
                className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{fact.categories.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {fact.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {fact.location_name}
                      {fact.distance && ` • ${(fact.distance / 1000).toFixed(1)}km`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    👍 {fact.vote_count_up}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Same Category Facts */}
      {categoryFacts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Layers className="w-4 h-4" />
            <span className="font-medium">Same Category</span>
          </div>
          <div className="space-y-2">
            {categoryFacts.map((fact, index) => (
              <motion.div
                key={fact.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (nearbyFacts.length + index) * 0.1 }}
                onClick={() => navigate(`/fact/${fact.id}`)}
                className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{fact.categories.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {fact.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {fact.location_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    👍 {fact.vote_count_up}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* View All Link */}
      {hasRelatedFacts && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => navigate(`/map?lat=${latitude}&lng=${longitude}&zoom=12`)}
            className="text-sm text-primary hover:underline w-full text-left"
          >
            View all facts in this area →
          </button>
        </div>
      )}
    </Card>
  );
};
