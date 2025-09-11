import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Mic, Filter, X, MapPin, QrCode, History, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface SearchFilters {
  categories: string[];
  status: string;
  verified: boolean;
  location?: { lat: number; lng: number; radius: number };
  dateRange?: { start: string; end: string };
}

interface AdvancedSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onVoiceSearch?: (transcript: string) => void;
  onQRScan?: () => void;
  initialQuery?: string;
  loading?: boolean;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  onSearch,
  onVoiceSearch,
  onQRScan,
  initialQuery = '',
  loading = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    status: '',
    verified: false
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Load search history and saved searches
  useEffect(() => {
    if (user) {
      loadSearchHistory();
      loadSavedSearches();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('search_history')
        .select('query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const uniqueQueries = [...new Set(data.map(h => h.query))];
        setSearchHistory(uniqueQueries);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const loadSavedSearches = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setSavedSearches(data);
      }
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  // Debounced autocomplete
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const { data } = await supabase.functions.invoke('intelligent-search', {
          body: { 
            query: searchQuery, 
            limit: 5,
            userId: user?.id 
          }
        });

        if (data?.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Error getting suggestions:', error);
      }
    }, 300),
    [user]
  );

  useEffect(() => {
    if (query) {
      debouncedGetSuggestions(query);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, debouncedGetSuggestions]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), filters);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion, filters);
  };

  const startVoiceSearch = async () => {
    if (!navigator.mediaDevices || !onVoiceSearch) {
      toast({
        title: "Voice search not supported",
        description: "Your browser doesn't support voice recording",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data } = await supabase.functions.invoke('voice-search', {
              body: { audio: base64Audio }
            });

            if (data?.text) {
              const transcript = data.text.trim();
              setQuery(transcript);
              onVoiceSearch(transcript);
              
              toast({
                title: "Voice search completed",
                description: `Searched for: "${transcript}"`,
              });
            }
          } catch (error) {
            console.error('Voice search error:', error);
            toast({
              title: "Voice search failed",
              description: "Please try again or use text search",
              variant: "destructive"
            });
          }
        };
        
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          stopVoiceSearch();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting voice search:', error);
      setIsRecording(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access for voice search",
        variant: "destructive"
      });
    }
  };

  const stopVoiceSearch = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const saveCurrentSearch = async () => {
    if (!user || !query.trim()) return;

    const searchName = prompt('Name for this saved search:');
    if (!searchName) return;

    try {
      await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name: searchName,
          query: query.trim(),
          filters: filters as any // Cast to any for JSONB compatibility
        });

      toast({
        title: "Search saved",
        description: `"${searchName}" has been saved to your searches`,
      });

      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Failed to save search",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search local lore, stories, and places..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-4 h-12 text-base bg-background/50 backdrop-blur border-border focus:border-primary"
            disabled={loading}
          />
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Voice Search Button */}
        {onVoiceSearch && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={isRecording ? stopVoiceSearch : startVoiceSearch}
            className="h-12 w-12"
            disabled={loading}
          >
            <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
        )}

        {/* QR Code Scanner */}
        {onQRScan && (
          <Button
            variant="outline"
            size="icon"
            onClick={onQRScan}
            className="h-12 w-12"
            disabled={loading}
          >
            <QrCode className="w-4 h-4" />
          </Button>
        )}

        {/* Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <Filter className="w-4 h-4" />
              {(filters.categories.length > 0 || filters.status || filters.verified) && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {filters.categories.length + (filters.status ? 1 : 0) + (filters.verified ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            {/* Filter content would go here */}
          </SheetContent>
        </Sheet>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-12 px-6"
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>

        {/* Save Search */}
        {user && query.trim() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={saveCurrentSearch}
            className="h-12 w-12"
          >
            <Star className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="p-2 bg-background/95 backdrop-blur border-border shadow-lg">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <History className="w-3 h-3" />
                    Recent searches
                  </div>
                  {searchHistory.map((historyItem, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                      onClick={() => handleSuggestionClick(historyItem)}
                    >
                      {historyItem}
                    </button>
                  ))}
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <Search className="w-3 h-3" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3" />
                    Saved searches
                  </div>
                  {savedSearches.slice(0, 3).map((saved) => (
                    <button
                      key={saved.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                      onClick={() => {
                        setQuery(saved.query);
                        setFilters(saved.filters || filters);
                        onSearch(saved.query, saved.filters || filters);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{saved.name}</div>
                      <div className="text-xs text-muted-foreground">{saved.query}</div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}