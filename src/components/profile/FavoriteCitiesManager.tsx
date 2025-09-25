import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, GripVertical, Heart, MapPin } from 'lucide-react';
import { useFavoriteCities, FavoriteCity } from '@/hooks/useFavoriteCities';
import { useAuth } from '@/contexts/AuthProvider';
import { CityAutocomplete } from './CityAutocomplete';

export const FavoriteCitiesManager: React.FC = () => {
  const { user } = useAuth();
  const { favoriteCities, loading, addFavoriteCity, removeFavoriteCity } = useFavoriteCities();
  const [isAdding, setIsAdding] = useState(false);
  const [newCity, setNewCity] = useState<Partial<FavoriteCity & { country?: string }>>({
    name: '',
    emoji: '🏙️',
    lat: 0,
    lng: 0,
    country: '',
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

  const handleCitySelect = (city: { name: string; lat: number; lng: number; country: string }) => {
    setNewCity({
      name: city.name,
      emoji: getCityEmoji(city.country),
      lat: city.lat,
      lng: city.lng,
      country: city.country,
    });
  };

  const getCityEmoji = (country: string): string => {
    const countryEmojis: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Japan': '🇯🇵',
      'China': '🇨🇳',
      'India': '🇮🇳',
      'Brazil': '🇧🇷',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱',
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Switzerland': '🇨🇭',
      'Austria': '🇦🇹',
      'Belgium': '🇧🇪',
      'Portugal': '🇵🇹',
    };
    return countryEmojis[country] || '🏙️';
  };

  const handleAddCity = async () => {
    if (!newCity.name || !newCity.emoji || !newCity.lat || !newCity.lng) {
      return;
    }

    await addFavoriteCity({
      name: newCity.name,
      emoji: newCity.emoji,
      lat: newCity.lat,
      lng: newCity.lng,
    } as FavoriteCity);
    
    setNewCity({ name: '', emoji: '🏙️', lat: 0, lng: 0, country: '' });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setNewCity({ name: '', emoji: '🏙️', lat: 0, lng: 0, country: '' });
    setIsAdding(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Favorite Cities
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your favorite cities for quick navigation on the map. These will appear as quick travel shortcuts.
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
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <span className="text-2xl">{city.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {city.name}
                      </div>
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
              <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-lg">Add Favorite City</h3>
                    <p className="text-sm text-muted-foreground">Search for any city worldwide</p>
                  </div>

                  <div className="space-y-4">
                    <CityAutocomplete
                      onCitySelect={handleCitySelect}
                      placeholder="Start typing a city name..."
                      label="Search City"
                    />

                    {newCity.name && (
                      <div className="p-4 bg-background rounded-lg border space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{newCity.emoji}</span>
                          <div>
                            <div className="font-medium">{newCity.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {newCity.country}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs text-muted-foreground">Latitude</Label>
                            <div className="font-mono">{newCity.lat?.toFixed(4)}</div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Longitude</Label>
                            <div className="font-mono">{newCity.lng?.toFixed(4)}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city-emoji">City Icon (optional)</Label>
                          <Input
                            id="city-emoji"
                            placeholder="🏙️"
                            value={newCity.emoji}
                            onChange={(e) => setNewCity({ ...newCity, emoji: e.target.value || '🏙️' })}
                            className="text-center text-lg"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={handleAddCity} 
                        disabled={!newCity.name || !newCity.lat || !newCity.lng}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full h-12">
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
