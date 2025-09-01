import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryOfTheDay {
  id: string;
  fact_id: string;
  date: string;
  ai_summary: string;
  fun_fact: string;
  facts: {
    title: string;
    description: string;
    location_name: string;
    media_urls?: string[];
    categories: {
      category_translations: { name: string }[];
    };
  };
}

interface DiscoveryOfTheDayProps {
  onExplore?: (factId: string) => void;
}

export const DiscoveryOfTheDay: React.FC<DiscoveryOfTheDayProps> = ({
  onExplore
}) => {
  const [discovery, setDiscovery] = useState<DiscoveryOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchDiscoveryOfTheDay = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data } = await supabase
        .from('discovery_of_the_day')
        .select(`
          *,
          facts (
            title,
            description,
            location_name,
            media_urls,
            categories (
              category_translations (name)
            )
          )
        `)
        .eq('date', today)
        .single();

      if (data) {
        setDiscovery(data);
      } else {
        // No discovery for today, try to generate one
        await generateDiscoveryOfTheDay();
      }
    } catch (error) {
      console.error('Error fetching discovery of the day:', error);
      // If no discovery exists, that's okay - we'll show a generate button
    } finally {
      setLoading(false);
    }
  };

  const generateDiscoveryOfTheDay = async () => {
    try {
      setIsGenerating(true);
      
      const { data: response, error } = await supabase.functions.invoke('discovery-of-the-day', {
        body: {}
      });

      if (error) throw error;

      if (response?.discovery) {
        setDiscovery(response.discovery);
        toast({
          title: "🌟 Discovery Generated!",
          description: "Today's discovery has been curated just for you",
        });
      }
    } catch (error) {
      console.error('Error generating discovery:', error);
      toast({
        title: "Error",
        description: "Failed to generate today's discovery",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExplore = async () => {
    if (!discovery) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Track interaction
        await supabase
          .from('user_discovery_history')
          .insert({
            user_id: user.id,
            fact_id: discovery.fact_id,
            interaction_type: 'view',
            context: {
              source: 'discovery_of_the_day',
              discovery_id: discovery.id,
              timestamp: new Date().toISOString()
            }
          });
      }

      onExplore?.(discovery.fact_id);
    } catch (error) {
      console.error('Error tracking discovery interaction:', error);
    }
  };

  useEffect(() => {
    fetchDiscoveryOfTheDay();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary animate-pulse" />
            Discovery of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-muted/30 rounded animate-pulse" />
            <div className="h-16 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 bg-muted/30 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!discovery) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Discovery of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              No discovery has been curated for today yet.
            </p>
            <Button 
              onClick={generateDiscoveryOfTheDay}
              disabled={isGenerating}
              className="relative"
            >
              {isGenerating && (
                <motion.div
                  className="absolute left-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              )}
              <span className={isGenerating ? "ml-8" : ""}>
                {isGenerating ? "Generating..." : "Generate Today's Discovery"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="h-5 w-5 text-primary" />
                </motion.div>
                Discovery of the Day
              </div>
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                <Clock className="h-3 w-3 mr-1" />
                Today
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Discovery */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                {discovery.facts.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {discovery.facts.location_name}
                {discovery.facts.categories?.category_translations?.[0] && (
                  <>
                    <span>•</span>
                    <span>{discovery.facts.categories.category_translations[0].name}</span>
                  </>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-4 bg-card/50 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm font-medium text-primary">AI Curated Summary</div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {discovery.ai_summary}
              </p>
            </div>

            {/* Fun Fact */}
            {discovery.fun_fact && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-3 bg-accent/20 rounded-lg border border-accent/30"
              >
                <div className="text-xs font-medium text-accent mb-1">💡 Fun Fact</div>
                <p className="text-sm text-foreground">
                  {discovery.fun_fact}
                </p>
              </motion.div>
            )}

            {/* Media Preview */}
            {discovery.facts.media_urls && discovery.facts.media_urls.length > 0 && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={discovery.facts.media_urls[0]} 
                  alt={discovery.facts.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Action Button */}
            <Button 
              onClick={handleExplore}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Star className="h-4 w-4 mr-2" />
              Explore This Discovery
            </Button>

            {/* Share Engagement */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Curated by AI</span>
              <span>•</span>
              <span>Updated daily</span>
              <span>•</span>
              <span>Personalized for you</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};