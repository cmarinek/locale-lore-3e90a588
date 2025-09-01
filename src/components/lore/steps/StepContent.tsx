import React, { useState } from 'react';
import { Card } from '@/components/ui/ios-card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import { motion } from 'framer-motion';

interface StepContentProps {
  data: {
    title: string;
    description: string;
    category_id: string;
  };
  onChange: (updates: { description?: string }) => void;
  subscriptionTier: 'free' | 'premium' | 'pro';
}

export const StepContent: React.FC<StepContentProps> = ({
  data,
  onChange,
  subscriptionTier
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('write');
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const hasAdvancedEditor = subscriptionTier === 'premium' || subscriptionTier === 'pro';
  const hasAiSuggestions = subscriptionTier === 'pro';

  const getAiSuggestions = async () => {
    if (!hasAiSuggestions || !data.title || !data.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and some description to get AI suggestions.",
        variant: "destructive"
      });
      return;
    }

    setLoadingSuggestions(true);
    try {
      const { data: suggestions, error } = await supabase.functions.invoke('ai-suggestions', {
        body: {
          title: data.title,
          description: data.description,
          category: data.category_id
        }
      });

      if (error) throw error;
      setAiSuggestions(suggestions.suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Content & Description</h3>
            <p className="text-muted-foreground">
              Tell the full story of your lore. Include historical context, interesting details, and any supporting information.
            </p>
          </div>

          {hasAdvancedEditor ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground">Description * (Markdown Supported)</Label>
                <Badge variant="default" className="bg-primary/20 text-primary">
                  {subscriptionTier} Editor
                </Badge>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Write
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="write" className="mt-4">
                  <MDEditor
                    value={data.description}
                    onChange={(value) => onChange({ description: value || '' })}
                    preview="edit"
                    height={300}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[300px] p-4 border border-border rounded-lg bg-background/50">
                    <MDEditor.Markdown 
                      source={data.description || 'Start writing to see preview...'} 
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your lore in detail..."
                value={data.description}
                onChange={(e) => onChange({ description: e.target.value })}
                className="min-h-[200px] bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Upgrade to Premium for markdown support and rich text editing features.
              </p>
            </div>
          )}
        </div>
      </Card>

      {hasAiSuggestions && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">AI-Powered Suggestions</h4>
                <Badge variant="default" className="bg-primary/20 text-primary">Pro</Badge>
              </div>
              <Button
                onClick={getAiSuggestions}
                disabled={loadingSuggestions || !data.title || !data.description}
                size="sm"
                variant="outline"
                className="border-primary/30"
              >
                {loadingSuggestions ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Get Suggestions
              </Button>
            </div>

            {aiSuggestions ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                <div className="whitespace-pre-wrap text-sm text-foreground bg-background/50 p-4 rounded-lg border border-border">
                  {aiSuggestions}
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Fill in your title and description, then click "Get Suggestions" for AI-powered recommendations to improve your content.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};