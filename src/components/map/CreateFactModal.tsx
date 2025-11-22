import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface CreateFactModalProps {
  open: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

interface Category {
  id: string;
  slug: string;
  icon: string;
  category_translations: Array<{ name: string; language_code: string }>;
}

const factSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  locationName: z.string().trim().min(1, 'Location name is required').max(200, 'Location name must be less than 200 characters'),
  categoryId: z.string().min(1, 'Please select a category'),
  sourceUrl: z.string().trim().url('Please enter a valid URL').optional().or(z.literal('')),
  timePeriod: z.string().trim().max(100).optional(),
  tags: z.string().trim().max(200).optional()
});

export const CreateFactModal: React.FC<CreateFactModalProps> = ({
  open,
  onClose,
  latitude,
  longitude,
  locationName: initialLocationName = ''
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(initialLocationName);
  const [categoryId, setCategoryId] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [timePeriod, setTimePeriod] = useState('');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, slug, icon, category_translations(name, language_code)')
          .order('slug');

        if (error) throw error;

        setCategories(data as Category[] || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: 'Warning',
          description: 'Failed to load categories. Please refresh the page.',
          variant: 'destructive'
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = factSchema.safeParse({
      title,
      description,
      locationName,
      categoryId,
      sourceUrl,
      timePeriod,
      tags
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to submit a fact',
          variant: 'destructive'
        });
        return;
      }

      // Parse tags from comma-separated string
      const tagsArray = validation.data.tags
        ? validation.data.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      const { error } = await supabase
        .from('facts')
        .insert({
          title: validation.data.title,
          description: validation.data.description,
          location_name: validation.data.locationName,
          latitude,
          longitude,
          author_id: user.id,
          category_id: validation.data.categoryId,
          status: 'pending',
          source_url: validation.data.sourceUrl || null,
          time_period: validation.data.timePeriod || null,
          tags: tagsArray.length > 0 ? tagsArray : null
        });

      if (error) throw error;

      toast({
        title: 'Fact submitted!',
        description: 'Your fact has been submitted and is pending verification. You\'ll be notified once it\'s approved.',
      });

      // Reset form and close
      setTitle('');
      setDescription('');
      setLocationName('');
      setCategoryId('');
      setSourceUrl('');
      setTimePeriod('');
      setTags('');
      onClose();
    } catch (error) {
      console.error('Error creating fact:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit fact. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Submit Local Fact or Lore
          </DialogTitle>
          <DialogDescription>
            Share historical facts, local legends, or cultural lore about this location
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md p-3">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Your submission will be reviewed before appearing on the map. Please ensure accuracy and provide verifiable information.
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Fact Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., First Public Library in America"
              maxLength={200}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.category_translations?.[0]?.name || cat.slug}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId}</p>
            )}
          </div>

          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name *</Label>
            <Input
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g., Central Park, New York"
              maxLength={200}
              className={errors.locationName ? 'border-destructive' : ''}
            />
            {errors.locationName && (
              <p className="text-xs text-destructive">{errors.locationName}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about this historical fact, legend, or cultural lore. Include relevant dates, people, or events."
              rows={6}
              maxLength={2000}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/2000 characters
            </p>
          </div>

          {/* Optional Fields Section */}
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Optional Information</p>

            {/* Source URL */}
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (Optional)</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://example.com/source"
                className={errors.sourceUrl ? 'border-destructive' : ''}
              />
              {errors.sourceUrl && (
                <p className="text-xs text-destructive">{errors.sourceUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Link to source material for verification
              </p>
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period (Optional)</Label>
              <Input
                id="timePeriod"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                placeholder="e.g., 1776, 1920s, Medieval Era"
                maxLength={100}
                className={errors.timePeriod ? 'border-destructive' : ''}
              />
              {errors.timePeriod && (
                <p className="text-xs text-destructive">{errors.timePeriod}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Historical period or date range
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., colonial, revolution, founding-fathers"
                maxLength={200}
                className={errors.tags ? 'border-destructive' : ''}
              />
              {errors.tags && (
                <p className="text-xs text-destructive">{errors.tags}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords for better searchability
              </p>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Coordinates:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loadingCategories}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Fact'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
