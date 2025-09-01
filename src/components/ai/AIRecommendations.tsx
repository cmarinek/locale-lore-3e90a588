import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, MapPin, Clock, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendation {
  id: string;
  fact_id: string;
  recommendation_type: string;
  confidence_score: number;
  reasoning: string;
  metadata: any;
  facts: {
    title: string;
    description: string;
    location_name: string;
    categories: {
      category_translations: { name: string }[];
    };
  };
}

interface AIRecommendationsProps {
  userLocation?: { latitude: number; longitude: number };
  onFactSelect?: (factId: string) => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userLocation,
  onFactSelect
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First check for existing recommendations
      const { data: existingRecs } = await supabase
        .from('ai_recommendations')
        .select(`
          *,
          facts (
            title,
            description,
            location_name,
            categories (
              category_translations (name)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_delivered', false)
        .gte('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(5);

      if (existingRecs && existingRecs.length > 0) {
        setRecommendations(existingRecs);
        setLoading(false);
        return;
      }

      // Generate new recommendations if none exist
      const { data: response } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          user_id: user.id,
          location: userLocation,
          preferences: {}
        }
      });

      if (response?.recommendations) {
        // Fetch full fact details
        const factIds = response.recommendations.map(r => r.fact_id);
        const { data: facts } = await supabase
          .from('facts')
          .select(`
            *,
            categories (
              category_translations (name)
            )
          `)
          .in('id', factIds);

        const enrichedRecs = response.recommendations.map(rec => ({
          ...rec,
          facts: facts?.find(f => f.id === rec.fact_id)
        })).filter(rec => rec.facts);

        setRecommendations(enrichedRecs);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load personalized recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userLocation]);

  const handleDismiss = async (recommendationId: string) => {
    setDismissed(prev => new Set(prev).add(recommendationId));
    
    try {
      await supabase
        .from('ai_recommendations')
        .update({ user_feedback: 'dismissed' })
        .eq('id', recommendationId);
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  const handleInteraction = async (recommendation: AIRecommendation, action: 'view' | 'like') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Track user interaction
      await supabase
        .from('user_discovery_history')
        .insert({
          user_id: user.id,
          fact_id: recommendation.fact_id,
          interaction_type: action,
          location: userLocation ? `POINT(${userLocation.longitude} ${userLocation.latitude})` : null,
          context: {
            recommendation_type: recommendation.recommendation_type,
            confidence_score: recommendation.confidence_score,
            timestamp: new Date().toISOString()
          }
        });

      // Update recommendation feedback
      await supabase
        .from('ai_recommendations')
        .update({ 
          user_feedback: action,
          is_delivered: true,
          delivered_at: new Date().toISOString()
        })
        .eq('id', recommendation.id);

      if (action === 'view' && onFactSelect) {
        onFactSelect(recommendation.fact_id);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'personalized': return <Brain className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'collaborative': return <Sparkles className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'personalized': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      case 'trending': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'location': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'collaborative': return 'bg-green-500/20 text-green-600 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const visibleRecommendations = recommendations.filter(rec => !dismissed.has(rec.id));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No personalized recommendations yet.</p>
            <p className="text-sm">Explore more facts to get better suggestions!</p>
            <Button 
              onClick={fetchRecommendations}
              variant="outline" 
              className="mt-4"
            >
              Generate Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Recommendations
          <Badge variant="outline" className="ml-auto">
            {visibleRecommendations.length} for you
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {visibleRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getRecommendationColor(recommendation.recommendation_type)}>
                      {getRecommendationIcon(recommendation.recommendation_type)}
                      {recommendation.recommendation_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {Math.round(recommendation.confidence_score * 100)}% match
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDismiss(recommendation.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {recommendation.facts?.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recommendation.facts?.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {recommendation.facts?.location_name}
                    {recommendation.facts?.categories?.category_translations?.[0] && (
                      <>
                        <span>•</span>
                        <span>{recommendation.facts.categories.category_translations[0].name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-muted/30 rounded-md">
                  <p className="text-xs text-muted-foreground italic">
                    <Brain className="h-3 w-3 inline mr-1" />
                    {recommendation.reasoning}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    onClick={() => handleInteraction(recommendation, 'view')}
                    className="flex-1"
                  >
                    Explore
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleInteraction(recommendation, 'like')}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchRecommendations}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};