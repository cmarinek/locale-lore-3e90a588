import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { useFavoriteCities, FavoriteCity } from '@/hooks/useFavoriteCities';
import { useAuth } from '@/contexts/AuthProvider';

export const FavoriteCitiesManager: React.FC = () => {
  const { user } = useAuth();
  const { favoriteCities, loading, addFavoriteCity, removeFavoriteCity } = useFavoriteCities();
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState<Partial<FavoriteCity>>({
    name: '',
    emoji: '',
    lat: 0,
    lng: 0,
  });

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Favorite Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to manage your favorite cities.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddCity = async () => {
    if (!newCity.name || !newCity.emoji || !newCity.lat || !newCity.lng) {
      return;
    }

    await addFavoriteCity(newCity as FavoriteCity);
    setNewCity({ name: '', emoji: '', lat: 0, lng: 0 });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewCity({ name: '', emoji: '', lat: 0, lng: 0 });
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Favorite Cities</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your favorite cities for quick navigation on the map. These will appear as quick travel buttons.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading...</p>
          </div>
        ) : (
          <>
            {/* Existing Cities */}
            <div className="space-y-2">
              {favoriteCities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No favorite cities yet. Add some for quick map navigation!
                </p>
              ) : (
                favoriteCities.map((city, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-lg">{city.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavoriteCity(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Add New City Form */}
            {isAdding ? (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city-name">City Name</Label>
                    <Input
                      id="city-name"
                      placeholder="New York"
                      value={newCity.name}
                      onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city-emoji">Emoji</Label>
                    <Input
                      id="city-emoji"
                      placeholder="🏙️"
                      value={newCity.emoji}
                      onChange={(e) => setNewCity({ ...newCity, emoji: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city-lat">Latitude</Label>
                    <Input
                      id="city-lat"
                      type="number"
                      step="any"
                      placeholder="40.7128"
                      value={newCity.lat || ''}
                      onChange={(e) => setNewCity({ ...newCity, lat: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city-lng">Longitude</Label>
                    <Input
                      id="city-lng"
                      type="number"
                      step="any"
                      placeholder="-74.0060"
                      value={newCity.lng || ''}
                      onChange={(e) => setNewCity({ ...newCity, lng: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddCity} size="sm">
                    Add City
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Favorite City
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
