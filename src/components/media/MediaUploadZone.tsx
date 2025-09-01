
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, Video, File, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaFile, MediaUploadProgress } from '@/types/media';

interface MediaUploadZoneProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  acceptedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  showPreview?: boolean;
}

export const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  onUploadComplete,
  acceptedTypes = ['image/*', 'video/*'],
  maxSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  showPreview = true
}) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<MediaUploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

  const processFile = useCallback(async (file: File): Promise<MediaFile | null> => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to progress tracking
    setUploadProgress(prev => [...prev, {
      fileId,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Upload to Supabase Storage
      const fileName = `${fileId}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('media-uploads')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress(prev => prev.map(p => 
              p.fileId === fileId 
                ? { ...p, progress: (progress.loaded / progress.total) * 100 }
                : p
            ));
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media-uploads')
        .getPublicUrl(fileName);

      // Update progress to processing
      setUploadProgress(prev => prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'processing', progress: 100 }
          : p
      ));

      // Process with AI moderation
      const { data: moderationResult } = await supabase.functions.invoke('moderate-media', {
        body: { 
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          mimeType: file.type
        }
      });

      // Create media record
      const mediaFile: MediaFile = {
        id: fileId,
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: urlData.publicUrl,
        status: moderationResult?.safe ? 'approved' : 'pending',
        uploadedBy: (await supabase.auth.getUser()).data.user?.id || '',
        uploadedAt: new Date().toISOString(),
      };

      // Generate thumbnail for images/videos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          const { data: thumbnailData } = await supabase.functions.invoke('generate-thumbnail', {
            body: { fileUrl: urlData.publicUrl, mimeType: file.type }
          });
          mediaFile.thumbnailUrl = thumbnailData?.thumbnailUrl;
        } catch (error) {
          console.warn('Thumbnail generation failed:', error);
        }
      }

      // Update progress to complete
      setUploadProgress(prev => prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'complete' }
          : p
      ));

      return mediaFile;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => prev.map(p => 
        p.fileId === fileId 
          ? { ...p, status: 'error', error: (error as Error).message }
          : p
      ));
      return null;
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const filesToUpload = acceptedFiles.slice(0, maxFiles - uploadedFiles.length);
    
    if (acceptedFiles.length > filesToUpload.length) {
      toast({
        title: "Upload Limit",
        description: `Can only upload ${maxFiles - uploadedFiles.length} more files`,
        variant: "destructive"
      });
    }

    const uploadPromises = filesToUpload.map(processFile);
    const results = await Promise.all(uploadPromises);
    const successful = results.filter(Boolean) as MediaFile[];
    
    setUploadedFiles(prev => [...prev, ...successful]);
    onUploadComplete?.(successful);

    // Clear completed uploads after delay
    setTimeout(() => {
      setUploadProgress(prev => prev.filter(p => p.status !== 'complete'));
    }, 2000);
  }, [uploadedFiles.length, maxFiles, processFile, onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: maxFiles > 1
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-4">
          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop files here...</p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">Drag & drop media files here</p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Max {Math.round(maxSize / (1024 * 1024))}MB per file, up to {maxFiles} files
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.map((progress) => (
          <motion.div
            key={progress.fileId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {progress.status === 'uploading' && 'Uploading...'}
                {progress.status === 'processing' && 'Processing...'}
                {progress.status === 'complete' && 'Complete!'}
                {progress.status === 'error' && 'Failed'}
              </span>
              <div className="flex items-center gap-2">
                {progress.status === 'complete' && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {progress.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress.progress)}%
                </span>
              </div>
            </div>
            <Progress value={progress.progress} className="h-2" />
            {progress.error && (
              <p className="text-sm text-red-500">{progress.error}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded Files Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.mimeType);
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <Card className="p-3 aspect-square flex flex-col items-center justify-center">
                      {file.thumbnailUrl ? (
                        <img 
                          src={file.thumbnailUrl} 
                          alt={file.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <>
                          <FileIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-xs text-center truncate w-full">
                            {file.originalName}
                          </p>
                        </>
                      )}
                      
                      <Badge 
                        className={`absolute top-1 left-1 ${getStatusColor(file.status)} text-white text-xs`}
                      >
                        {file.status}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
