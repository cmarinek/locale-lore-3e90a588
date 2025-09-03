
import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileAudio, 
  FileText, 
  Check,
  AlertCircle,
  Loader2,
  Camera,
  Crop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { UploadFile, MediaUploadProgress } from '@/types/media';
import { toast } from '@/hooks/use-toast';

interface MediaUploadZoneProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  enableBulkUpload?: boolean;
}

export const MediaUploadZone: React.FC<MediaUploadZoneProps> = ({
  onUploadComplete,
  allowedTypes = ['image/*', 'video/*', 'audio/*'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  enableBulkUpload = true,
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, MediaUploadProgress>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      toast({
        title: "File rejected",
        description: `${rejection.file.name}: ${rejection.errors[0]?.message}`,
        variant: "destructive",
      });
    });

    // Process accepted files
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      progress: 0,
      status: 'pending',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setUploadFiles(prev => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, maxFiles);
    });
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: enableBulkUpload,
  });

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const uploadFile = async (uploadFile: UploadFile): Promise<UploadFile> => {
    try {
      // Update progress to show upload started
      setUploadProgress(prev => ({
        ...prev,
        [uploadFile.id]: { fileId: uploadFile.id, progress: 0, status: 'uploading' }
      }));

      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, uploadFile.file, {
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Update progress to processing
      setUploadProgress(prev => ({
        ...prev,
        [uploadFile.id]: { 
          fileId: uploadFile.id, 
          progress: 90, 
          status: 'processing' 
        }
      }));

      // Generate thumbnail if it's an image or video
      let thumbnailUrl;
      if (uploadFile.type.startsWith('image/') || uploadFile.type.startsWith('video/')) {
        try {
          const { data: thumbnailData } = await supabase.functions.invoke('generate-thumbnail', {
            body: { fileUrl: urlData.publicUrl, fileType: uploadFile.type }
          });
          thumbnailUrl = thumbnailData?.thumbnailUrl;
        } catch (error) {
          console.error('Thumbnail generation failed:', error);
        }
      }

      // Submit for moderation
      await supabase.functions.invoke('moderate-media', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          fileSize: uploadFile.size,
          thumbnailUrl,
        }
      });

      // Mark as completed
      setUploadProgress(prev => ({
        ...prev,
        [uploadFile.id]: { 
          fileId: uploadFile.id, 
          progress: 100, 
          status: 'completed' 
        }
      }));

      return {
        ...uploadFile,
        status: 'completed',
        progress: 100,
        url: urlData.publicUrl,
      };
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      setUploadProgress(prev => ({
        ...prev,
        [uploadFile.id]: { 
          fileId: uploadFile.id, 
          progress: 0, 
          status: 'error',
          error: error.message 
        }
      }));

      return {
        ...uploadFile,
        status: 'error',
        error: error.message,
      };
    }
  };

  const handleUploadAll = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = uploadFiles.map(uploadFile);
      const results = await Promise.all(uploadPromises);
      
      setUploadFiles(results);
      onUploadComplete?.(results);
      
      toast({
        title: "Upload completed",
        description: `${results.length} files uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Bulk upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="flex flex-col items-center gap-4">
              {isDragActive ? (
                <Upload className="w-12 h-12 text-primary animate-bounce" />
              ) : (
                <Upload className="w-12 h-12 text-muted-foreground" />
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload Media Files'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop files here, or click to select files
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                  <span>Supported: {allowedTypes.join(', ')}</span>
                  <span>•</span>
                  <span>Max size: {formatFileSize(maxFileSize)}</span>
                  <span>•</span>
                  <span>Max files: {maxFiles}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline">
                  <Camera className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <Button type="button" variant="outline">
                  <Crop className="w-4 h-4 mr-2" />
                  Camera
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Files ({uploadFiles.length})</h3>
              <div className="flex gap-2">
                <Button
                  onClick={() => setUploadFiles([])}
                  variant="outline"
                  size="sm"
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleUploadAll}
                  disabled={isUploading || uploadFiles.length === 0}
                  size="sm"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload All
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {uploadFiles.map((file) => {
                  const progress = uploadProgress[file.id];
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {progress && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>
                                {progress.status === 'uploading' && 'Uploading...'}
                                {progress.status === 'processing' && 'Processing...'}
                                {progress.status === 'completed' && 'Completed'}
                                {progress.status === 'error' && 'Error'}
                              </span>
                              <span>{Math.round(progress.progress)}%</span>
                            </div>
                            <Progress value={progress.progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {file.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {file.status === 'error' && (
                          <Badge variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        {file.status === 'pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        onClick={() => removeFile(file.id)}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          All uploaded files will be automatically scanned for inappropriate content. 
          Files that violate our community guidelines will be rejected.
        </AlertDescription>
      </Alert>
    </div>
  );
};
