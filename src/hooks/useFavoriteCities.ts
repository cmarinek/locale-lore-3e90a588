import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from '@/hooks/use-toast';

export interface FavoriteCity {
  name: string;
  emoji: string;
  lat: number;
  lng: number;
}

export const useFavoriteCities = () => {
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch favorite cities
  const fetchFavoriteCities = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('favorite_cities')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching favorite cities:', error);
        return;
      }

      if (profile?.favorite_cities && Array.isArray(profile.favorite_cities)) {
        setFavoriteCities(profile.favorite_cities as unknown as FavoriteCity[]);
      }
    } catch (error) {
      console.error('Error fetching favorite cities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a favorite city
  const addFavoriteCity = async (city: FavoriteCity) => {
    if (!user) return;

    try {
      const updatedCities = [...favoriteCities, city];
      
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_cities: updatedCities as any })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add favorite city. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setFavoriteCities(updatedCities);
      toast({
        title: "Success",
        description: `${city.name} added to your favorite cities!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add favorite city. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Remove a favorite city
  const removeFavoriteCity = async (index: number) => {
    if (!user) return;

    try {
      const updatedCities = favoriteCities.filter((_, i) => i !== index);
      
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_cities: updatedCities as any })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove favorite city. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setFavoriteCities(updatedCities);
      toast({
        title: "Success",
        description: "Favorite city removed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove favorite city. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update favorite cities order
  const updateFavoriteCitiesOrder = async (newOrder: FavoriteCity[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorite_cities: newOrder as any })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update cities order. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setFavoriteCities(newOrder);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cities order. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFavoriteCities();
  }, [user]);

  return {
    favoriteCities,
    loading,
    addFavoriteCity,
    removeFavoriteCity,
    updateFavoriteCitiesOrder,
    refetch: fetchFavoriteCities,
  };
};