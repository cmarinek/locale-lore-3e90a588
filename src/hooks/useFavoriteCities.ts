import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';
import { useOptimisticUpdate } from './useOptimisticUpdate';

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
  const { execute, isPending } = useOptimisticUpdate();

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

  // Add a favorite city with optimistic update
  const addFavoriteCity = async (city: FavoriteCity) => {
    if (!user) return;

    const updatedCities = [...favoriteCities, city];
    
    await execute({
      onUpdate: () => setFavoriteCities(updatedCities),
      onRevert: () => setFavoriteCities(favoriteCities),
      serverUpdate: async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ favorite_cities: updatedCities as any })
          .eq('id', user.id);

        if (error) throw error;
      },
      successMessage: `${city.name} added to your favorite cities!`,
      errorMessage: "Failed to add favorite city. Please try again.",
    });
  };

  // Remove a favorite city with optimistic update
  const removeFavoriteCity = async (index: number) => {
    if (!user) return;

    const updatedCities = favoriteCities.filter((_, i) => i !== index);
    
    await execute({
      onUpdate: () => setFavoriteCities(updatedCities),
      onRevert: () => setFavoriteCities(favoriteCities),
      serverUpdate: async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ favorite_cities: updatedCities as any })
          .eq('id', user.id);

        if (error) throw error;
      },
      successMessage: "Favorite city removed successfully!",
      errorMessage: "Failed to remove favorite city. Please try again.",
    });
  };

  // Update favorite cities order with optimistic update
  const updateFavoriteCitiesOrder = async (newOrder: FavoriteCity[]) => {
    if (!user) return;
    
    await execute({
      onUpdate: () => setFavoriteCities(newOrder),
      onRevert: () => setFavoriteCities(favoriteCities),
      serverUpdate: async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ favorite_cities: newOrder as any })
          .eq('id', user.id);

        if (error) throw error;
      },
      silent: true, // No toast for reordering
      errorMessage: "Failed to update cities order. Please try again.",
    });
  };

  useEffect(() => {
    fetchFavoriteCities();
  }, [user]);

  return {
    favoriteCities,
    loading: loading || isPending,
    addFavoriteCity,
    removeFavoriteCity,
    updateFavoriteCitiesOrder,
    refetch: fetchFavoriteCities,
  };
};