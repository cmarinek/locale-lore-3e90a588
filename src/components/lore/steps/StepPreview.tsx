import React from 'react';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, User, ImageIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';

interface StepPreviewProps {
  data: {
    title: string;
    description: string;
    category_id: string;
    location_name: string;
    latitude: number | null;
    longitude: number | null;
    media_urls: string[];
  };
  onChange: (updates: any) => void;
  subscriptionTier: 'free' | 'premium' | 'pro';
}

export const StepPreview: React.FC<StepPreviewProps> = ({
  data,
  subscriptionTier
}) => {
  const hasAdvancedEditor = subscriptionTier === 'premium' || subscriptionTier === 'pro';

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Preview & Submit</h3>
            <p className="text-muted-foreground">
              Review your lore submission before publishing. Make sure all information is accurate and complete.
            </p>
          </div>
        </div>
      </Card>

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-border/50">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {data.title || 'Untitled Lore'}
                </h1>
                <Badge variant="default" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                  Pending Review
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>You</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                {data.location_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{data.location_name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {data.description ? (
                hasAdvancedEditor ? (
                  <MDEditor.Markdown 
                    source={data.description} 
                    style={{ backgroundColor: 'transparent', color: 'inherit' }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap text-foreground">
                    {data.description}
                  </div>
                )
              ) : (
                <div className="text-muted-foreground italic">
                  No description provided
                </div>
              )}
            </div>

            {/* Media Gallery */}
            {data.media_urls.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media ({data.media_urls.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {data.media_urls.map((url, index) => {
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                      url.split('.').pop()?.toLowerCase() || ''
                    );

                    return (
                      <div
                        key={index}
                        className="aspect-square rounded-lg border border-border overflow-hidden bg-background/50"
                      >
                        {isImage ? (
                          <img 
                            src={url} 
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Details */}
            {data.latitude && data.longitude && (
              <div className="p-4 bg-background/50 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Details
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 text-foreground">{data.location_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="ml-2 text-foreground font-mono">
                      {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Submission Notes */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">What happens next?</h4>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </div>
              <p className="text-muted-foreground">
                Your lore will be submitted for review by our moderation team.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </div>
              <p className="text-muted-foreground">
                We'll verify the information and check for quality and accuracy.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </div>
              <p className="text-muted-foreground">
                Once approved, your lore will be published and visible to the community.
              </p>
            </div>
          </div>
          
          {subscriptionTier === 'pro' && (
            <div className="mt-4 p-3 bg-background/50 border border-border rounded-lg">
              <Badge variant="default" className="bg-primary/20 text-primary mb-2">Pro Priority</Badge>
              <p className="text-xs text-muted-foreground">
                As a Pro subscriber, your submission will receive priority review and typically be processed within 24 hours.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};