
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, AlertTriangle, Loader, Languages, MapPin, Copy, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIFactProcessorProps {
  factData: {
    title: string;
    description: string;
    location_name?: string;
  };
  onProcessingComplete?: (results: any) => void;
}

export const AIFactProcessor: React.FC<AIFactProcessorProps> = ({
  factData,
  onProcessingComplete
}) => {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const processWithAI = async () => {
    setProcessing(true);
    try {
      // Parallel AI processing
      const [
        categorization,
        moderation,
        duplicates,
        locationSuggestions,
        verification,
        summary
      ] = await Promise.all([
        // Auto-categorization
        supabase.functions.invoke('ai-categorize', {
          body: factData
        }),
        // Content moderation
        supabase.functions.invoke('content-moderation', {
          body: { content: `${factData.title} ${factData.description}`, type: 'fact' }
        }),
        // Duplicate detection
        supabase.functions.invoke('duplicate-detection', {
          body: factData
        }),
        // Smart location suggestions
        supabase.functions.invoke('smart-location', {
          body: { input: factData.location_name || factData.title, context: factData }
        }),
        // Fact verification
        supabase.functions.invoke('fact-verification', {
          body: factData
        }),
        // Auto-summarization
        supabase.functions.invoke('auto-summarize', {
          body: { content: factData.description, type: 'fact' }
        })
      ]);

      const processedResults = {
        categorization: categorization.data,
        moderation: moderation.data,
        duplicates: duplicates.data,
        locationSuggestions: locationSuggestions.data,
        verification: verification.data,
        summary: summary.data
      };

      setResults(processedResults);
      onProcessingComplete?.(processedResults);

      toast({
        title: "AI Processing Complete",
        description: "Your fact has been analyzed by AI systems",
      });

    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "Processing Error",
        description: "Some AI features may not be available",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const translateContent = async (targetLanguage: string) => {
    try {
      const { data } = await supabase.functions.invoke('translate-content', {
        body: {
          content: `${factData.title}\n\n${factData.description}`,
          target_language: targetLanguage
        }
      });

      if (data?.translated_content) {
        navigator.clipboard.writeText(data.translated_content);
        toast({
          title: "Translation Complete",
          description: `Content translated to ${targetLanguage} and copied to clipboard`,
        });
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate content",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Fact Processor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!results && (
          <Button 
            onClick={processWithAI} 
            disabled={processing}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Processing with AI...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        )}

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Categorization Results */}
            {results.categorization && (
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Auto-Categorization
                </h4>
                <Badge variant="secondary">
                  {results.categorization.suggested_category?.name}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.categorization.reasoning}
                </p>
              </div>
            )}

            {/* Moderation Results */}
            {results.moderation && (
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  {results.moderation.safe ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  Content Moderation
                </h4>
                <div className="flex gap-2 mb-2">
                  <Badge variant={results.moderation.safe ? "default" : "destructive"}>
                    {results.moderation.safe ? "Safe" : "Needs Review"}
                  </Badge>
                  <Badge variant="outline">
                    {results.moderation.sentiment}
                  </Badge>
                </div>
                {results.moderation.issues?.length > 0 && (
                  <ul className="text-sm text-muted-foreground">
                    {results.moderation.issues.map((issue: string, i: number) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Duplicate Detection */}
            {results.duplicates && results.duplicates.is_duplicate && (
              <div className="p-3 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Potential Duplicates Found
                </h4>
                <p className="text-sm text-muted-foreground">
                  {results.duplicates.duplicates?.length || 0} potential duplicates detected
                </p>
              </div>
            )}

            {/* Verification Status */}
            {results.verification && (
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Fact Verification
                </h4>
                <Badge 
                  variant={
                    results.verification.verification_status === 'verified' ? 'default' : 
                    results.verification.verification_status === 'questionable' ? 'destructive' : 'secondary'
                  }
                >
                  {results.verification.verification_status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Confidence: {Math.round(results.verification.confidence_score * 100)}%
                </p>
              </div>
            )}

            {/* Smart Summary */}
            {results.summary && (
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">AI Summary</h4>
                <p className="text-sm">{results.summary.summary}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(results.summary.summary)}
                  className="mt-2"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Summary
                </Button>
              </div>
            )}

            {/* Translation Options */}
            <div className="p-3 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Languages className="h-4 w-4 text-purple-500" />
                Quick Translations
              </h4>
              <div className="flex gap-2 flex-wrap">
                {['Spanish', 'French', 'German', 'Italian', 'Portuguese'].map(lang => (
                  <Button
                    key={lang}
                    variant="outline"
                    size="sm"
                    onClick={() => translateContent(lang)}
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Suggestions */}
            {results.locationSuggestions?.suggestions?.length > 0 && (
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  Smart Location Suggestions
                </h4>
                <div className="space-y-1">
                  {results.locationSuggestions.suggestions.slice(0, 3).map((location: any, i: number) => (
                    <div key={i} className="text-sm flex justify-between">
                      <span>{location.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(location.relevance_score * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
