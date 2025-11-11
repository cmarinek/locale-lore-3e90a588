import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName?: string;
}

const storySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  locationName: z.string().trim().min(1, 'Location name is required').max(200, 'Location name must be less than 200 characters')
});

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  open,
  onClose,
  latitude,
  longitude,
  locationName: initialLocationName = ''
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(initialLocationName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = storySchema.safeParse({ title, description, locationName });
    
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
          description: 'Please sign in to create a story',
          variant: 'destructive'
        });
        return;
      }

      // Get a default category (you may want to add category selection)
      const { data: categories } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
        .single();

      const { error } = await supabase
        .from('facts')
        .insert({
          title: validation.data.title,
          description: validation.data.description,
          location_name: validation.data.locationName,
          latitude,
          longitude,
          author_id: user.id,
          category_id: categories?.id || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Story created!',
        description: 'Your story has been submitted and is pending verification',
      });

      // Reset form and close
      setTitle('');
      setDescription('');
      setLocationName('');
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to create story. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Create Story at Location
          </DialogTitle>
          <DialogDescription>
            Share a story, legend, or historical fact about this location
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter story title"
              maxLength={200}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="description">Story *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the story..."
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

          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Coordinates:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex gap-2">
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
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Story'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
