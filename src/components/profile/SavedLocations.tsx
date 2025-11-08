import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Heart, BookmarkX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { log } from '@/utils/logger';

interface SavedLocation {
  id: string;
  fact_id: string;
  created_at: string;
  notes?: string;
  facts: {
    id: string;
    title: string;
    description: string;
    location_name: string;
    latitude: number;
    longitude: number;
    status: string;
    vote_count_up: number;
  };
}

export const SavedLocations: React.FC = () => {
  const { user } = useAuth();
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedLocations = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('saved_locations')
          .select(`
            *,
            facts (
              id,
              title,
              description,
              location_name,
              latitude,
              longitude,
              status,
              vote_count_up
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedLocations(data || []);
      } catch (error) {
        log.error('Failed to fetch saved locations', error, { component: 'SavedLocations' });
      } finally {
        setLoading(false);
      }
    };

    fetchSavedLocations();
  }, [user]);

  const handleRemoveBookmark = async (savedLocationId: string) => {
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', savedLocationId);

      if (error) throw error;

      setSavedLocations(prev => 
        prev.filter(location => location.id !== savedLocationId)
      );

      toast({
        title: "Bookmark removed",
        description: "Location has been removed from your saved locations.",
      });
    } catch (error) {
      log.error('Failed to remove bookmark', error, { component: 'SavedLocations' });
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Saved Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedLocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Saved Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved locations yet</h3>
            <p className="text-muted-foreground">
              Bookmark interesting locations you discover to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Saved Locations ({savedLocations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedLocations.map((savedLocation, index) => (
            <motion.div
              key={savedLocation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-lg">{savedLocation.facts.title}</h3>
                    <Badge variant={savedLocation.facts.status === 'verified' ? 'default' : 'secondary'}>
                      {savedLocation.facts.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {savedLocation.facts.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {savedLocation.facts.location_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Saved {new Date(savedLocation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {savedLocation.notes && (
                    <div className="mb-3 p-2 bg-muted rounded text-sm">
                      <strong>Your note:</strong> {savedLocation.notes}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      {savedLocation.facts.vote_count_up} votes
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${savedLocation.facts.latitude},${savedLocation.facts.longitude}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveBookmark(savedLocation.id)}
                  >
                    <BookmarkX className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};