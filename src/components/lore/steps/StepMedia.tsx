import React, { useCallback, useState } from 'react';
import { Card } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface StepMediaProps {
  data: {
    media_urls: string[];
  };
  onChange: (updates: { media_urls?: string[] }) => void;
  subscriptionTier: 'free' | 'premium' | 'pro';
}

export const StepMedia: React.FC<StepMediaProps> = ({
  data,
  onChange,
  subscriptionTier
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string[]>([]);

  const maxFiles = subscriptionTier === 'pro' ? 10 : subscriptionTier === 'premium' ? 5 : 2;
  const maxSize = subscriptionTier === 'pro' ? 50 * 1024 * 1024 : subscriptionTier === 'premium' ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) return;

    const remainingSlots = maxFiles - data.media_urls.length;
    const filesToUpload = acceptedFiles.slice(0, remainingSlots);

    if (acceptedFiles.length > remainingSlots) {
      toast({
        title: "Upload Limit",
        description: `You can only upload ${remainingSlots} more file(s) with your ${subscriptionTier} plan.`,
        variant: "destructive"
      });
    }

    const uploadPromises = filesToUpload.map(async (file) => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setUploading(prev => [...prev, fileId]);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${fileId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('lore-media')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('lore-media')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive"
        });
        return null;
      } finally {
        setUploading(prev => prev.filter(id => id !== fileId));
      }
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const validUrls = uploadedUrls.filter(url => url !== null) as string[];
    
    if (validUrls.length > 0) {
      onChange({ media_urls: [...data.media_urls, ...validUrls] });
    }
  }, [user, data.media_urls, maxFiles, subscriptionTier, onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxSize,
    multiple: true
  });

  const removeFile = async (url: string) => {
    onChange({ media_urls: data.media_urls.filter(mediaUrl => mediaUrl !== url) });
    
    // Clean up from storage
    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('lore-media').remove([`${user?.id}/${fileName}`]);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return Image;
    } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension || '')) {
      return Video;
    }
    return FileText;
  };

  return (
    <Card className="p-6 space-y-6 bg-card/50 backdrop-blur">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-foreground">Media & Attachments</h3>
          <Badge variant="default" className="bg-primary/20 text-primary">
            {data.media_urls.length}/{maxFiles} files
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Add images, videos, or documents to support your lore. Media helps readers better understand and visualize your content.
        </p>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 bg-background/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-foreground">
              Drag & drop files here, or <span className="text-primary">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports images and videos. Max {maxSize / (1024 * 1024)}MB per file.
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Files */}
      {(data.media_urls.length > 0 || uploading.length > 0) && (
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Uploaded Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence>
              {data.media_urls.map((url, index) => {
                const FileIcon = getFileIcon(url);
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                  url.split('.').pop()?.toLowerCase() || ''
                );

                return (
                  <motion.div
                    key={url}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg border border-border overflow-hidden bg-background/50">
                      {isImage ? (
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(url)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Uploading indicators */}
              {uploading.map((id) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-square rounded-lg border border-border bg-background/50 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-muted-foreground">Uploading...</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Subscription Benefits */}
      <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className={`p-3 rounded-lg ${subscriptionTier === 'free' ? 'bg-muted/50' : 'bg-background/50'}`}>
          <h5 className="font-medium text-sm mb-1">Free</h5>
          <p className="text-xs text-muted-foreground">2 files, 5MB each</p>
        </div>
        <div className={`p-3 rounded-lg ${subscriptionTier === 'premium' ? 'bg-primary/10 border border-primary/20' : 'bg-background/50'}`}>
          <h5 className="font-medium text-sm mb-1">Premium</h5>
          <p className="text-xs text-muted-foreground">5 files, 20MB each</p>
        </div>
        <div className={`p-3 rounded-lg ${subscriptionTier === 'pro' ? 'bg-primary/10 border border-primary/20' : 'bg-background/50'}`}>
          <h5 className="font-medium text-sm mb-1">Pro</h5>
          <p className="text-xs text-muted-foreground">10 files, 50MB each</p>
        </div>
      </div>
    </Card>
  );
};