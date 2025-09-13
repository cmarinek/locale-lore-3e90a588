import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  X, 
  History, 
  TrendingUp, 
  MapPin, 
  Filter,
  Star,
  Clock,
  Sparkles
} from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface SearchSuggestion {
  query: string;
  type: 'history' | 'trending' | 'location' | 'category' | 'ai';
  count?: number;
  timestamp?: number;
  icon?: React.ReactNode;
  confidence?: number;
}

interface EnhancedSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onVoiceSearch?: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero' | 'inline';
  showFilters?: boolean;
  showVoice?: boolean;
  showHistory?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  loading?: boolean;
  maxSuggestions?: number;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSearch,
  onVoiceSearch,
  placeholder = "Search local lore, stories, and places...",
  className,
  size = 'md',
  variant = 'default',
  showFilters = false,
  showVoice = true,
  showHistory = true,
  autoFocus = false,
  disabled = false,
  loading = false,
  maxSuggestions = 8
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internalValue, setInternalValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Use controlled or uncontrolled value
  const searchValue = controlledValue !== undefined ? controlledValue : internalValue;

  // Debounce search input for performance
  const debouncedValue = useDebounce(searchValue, 300);

  // Load search history on mount
  useEffect(() => {
    if (user && showHistory) {
      loadSearchHistory();
    }
  }, [user, showHistory]);

  // Generate suggestions when value changes
  useEffect(() => {
    if (debouncedValue.length > 1) {
      generateSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue]);

  const loadSearchHistory = async () => {
    if (!user) return;
    
    try {
      const savedHistory = localStorage.getItem(`search_history_${user.id}`);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = (query: string) => {
    if (!user || !query.trim()) return;
    
    try {
      const savedHistory = localStorage.getItem(`search_history_${user.id}`);
      let history = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Remove existing entry and add to front
      history = history.filter((item: string) => item !== query);
      history.unshift(query);
      
      // Keep only last 20 items
      history = history.slice(0, 20);
      
      localStorage.setItem(`search_history_${user.id}`, JSON.stringify(history));
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const generateSuggestions = useCallback(async (query: string) => {
    const newSuggestions: SearchSuggestion[] = [];

    // Add search history suggestions
    if (showHistory && searchHistory.length > 0) {
      const historySuggestions = searchHistory
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(item => ({
          query: item,
          type: 'history' as const,
          timestamp: Date.now()
        }));
      newSuggestions.push(...historySuggestions);
    }

    // Add trending/popular suggestions
    const trendingTerms = [
      'hidden waterfalls', 'ghost stories', 'historic landmarks', 
      'secret tunnels', 'local legends', 'mysterious places'
    ];
    const trendingSuggestions = trendingTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(term => ({
        query: term,
        type: 'trending' as const,
        count: Math.floor(Math.random() * 100) + 10
      }));
    newSuggestions.push(...trendingSuggestions);

    // Add category suggestions
    const categories = ['history', 'nature', 'architecture', 'mystery', 'culture'];
    const categorySuggestions = categories
      .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 2)
      .map(cat => ({
        query: cat,
        type: 'category' as const
      }));
    newSuggestions.push(...categorySuggestions);

    // Try to get AI suggestions from backend
    try {
      const { data } = await supabase.functions.invoke('intelligent-search', {
        body: { 
          query, 
          limit: 2,
          suggestionOnly: true,
          userId: user?.id 
        }
      });

      if (data?.suggestions) {
        const aiSuggestions = data.suggestions.map((suggestion: string) => ({
          query: suggestion,
          type: 'ai' as const,
          confidence: 0.9
        }));
        newSuggestions.push(...aiSuggestions);
      }
    } catch (error) {
      // Fallback to local suggestions only
      console.log('AI suggestions unavailable, using local suggestions');
    }

    setSuggestions(newSuggestions.slice(0, maxSuggestions));
    setShowSuggestions(true);
  }, [searchHistory, showHistory, maxSuggestions, user]);

  const handleInputChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSearch = (query?: string) => {
    const searchQuery = query || searchValue;
    if (!searchQuery.trim()) return;

    saveToHistory(searchQuery.trim());
    onSearch?.(searchQuery.trim());
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
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
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data } = await supabase.functions.invoke('voice-search', {
              body: { audio: base64Audio }
            });

            if (data?.text) {
              const transcript = data.text.trim();
              handleInputChange(transcript);
              onVoiceSearch?.(transcript);
              
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
          mediaRecorderRef.current.stop();
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

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      case 'category':
        return <Search className="w-4 h-4 text-green-500" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const sizeClasses = {
    sm: 'h-11 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  const variantClasses = {
    default: 'bg-background border-border/40 focus-within:border-primary shadow-sm hover:shadow-md',
    hero: 'bg-background/95 border-border/30 backdrop-blur-md focus-within:border-primary focus-within:shadow-lg',
    inline: 'bg-transparent border-transparent focus-within:bg-background/50 focus-within:border-border/50'
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Main Search Input Container */}
      <div className={cn(
        "relative flex items-center gap-2 rounded-2xl border transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        showSuggestions && "rounded-b-none shadow-lg",
        disabled && "opacity-50 cursor-not-allowed",
        "group focus-within:ring-2 focus-within:ring-primary/20"
      )}>
        {/* Search Icon */}
        <div className="flex-shrink-0 pl-4">
          <Search className={cn(
            "text-muted-foreground transition-colors group-focus-within:text-primary",
            size === 'sm' && "w-4 h-4",
            size === 'md' && "w-5 h-5", 
            size === 'lg' && "w-6 h-6"
          )} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled || loading}
          className={cn(
            "flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground",
            "focus:ring-0 focus:outline-none",
            size === 'sm' && "px-2 text-sm",
            size === 'md' && "px-3 text-base",
            size === 'lg' && "px-4 text-lg"
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 pr-2">
          {/* Clear Button */}
          {searchValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                handleInputChange('');
                inputRef.current?.focus();
              }}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Voice Search Button */}
          {showVoice && onVoiceSearch && (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "ghost"}
              size="sm"
              onClick={isRecording ? stopVoiceSearch : startVoiceSearch}
              disabled={disabled || loading}
              className={cn(
                "h-8 w-8 p-0 touch-manipulation",
                isRecording && "animate-pulse bg-destructive/20"
              )}
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}

          {/* Filters Button */}
          {showFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || loading}
              className="h-8 w-8 p-0 touch-manipulation"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>

      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50"
          >
            <Card className={cn(
              "border-t-0 rounded-t-none shadow-xl bg-background/95 backdrop-blur-sm",
              "max-h-80 overflow-y-auto overscroll-contain"
            )}>
              <div className="p-2 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion.type}-${suggestion.query}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSearch(suggestion.query)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left",
                      "hover:bg-muted/50 active:bg-muted transition-colors",
                      "group touch-manipulation",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getSuggestionIcon(suggestion.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {suggestion.query}
                      </div>
                      {suggestion.count !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.count} results
                        </div>
                      )}
                    </div>

                    {/* Type Badge */}
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-1 opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      {suggestion.type}
                    </Badge>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedSearchBar;
