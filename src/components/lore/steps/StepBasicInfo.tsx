import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/ios-card';
import { Input } from '@/components/ui/ios-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/ios-badge';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  slug: string;
  icon: string;
  color: string;
  category_translations: {
    name: string;
    language_code: string;
  }[];
}

interface StepBasicInfoProps {
  data: {
    title: string;
    category_id: string;
  };
  onChange: (updates: { title?: string; category_id?: string }) => void;
  subscriptionTier: 'free' | 'premium' | 'pro';
}

export const StepBasicInfo: React.FC<StepBasicInfoProps> = ({
  data,
  onChange,
  subscriptionTier
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select(`
          id,
          slug,
          icon,
          color,
          category_translations!inner(
            name,
            language_code
          )
        `)
        .eq('category_translations.language_code', 'en');

      if (error) throw error;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">Basic Information</h3>
        <p className="text-muted-foreground">
          Start by giving your lore a compelling title and selecting the most appropriate category.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-foreground">Title *</Label>
          <Input
            id="title"
            placeholder="Enter a captivating title for your lore..."
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            A good title is specific, engaging, and gives readers a clear idea of what to expect.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-foreground">Category *</Label>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading categories...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => onChange({ category_id: category.id })}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      data.category_id === category.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50 bg-background/50 text-foreground hover:text-primary'
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium">
                      {category.category_translations[0]?.name || category.slug}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {subscriptionTier === 'pro' && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-primary/20 text-primary">Pro</Badge>
              <span className="text-sm font-medium text-foreground">Enhanced Features</span>
            </div>
            <p className="text-xs text-muted-foreground">
              As a Pro subscriber, you'll get AI-powered title suggestions and category recommendations after completing this step.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};