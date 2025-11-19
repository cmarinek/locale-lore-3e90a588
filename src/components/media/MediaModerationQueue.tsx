
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaFile } from '@/types/media';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  FileImage,
  FileVideo,
  File,
  Download,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const MediaModerationQueue: React.FC = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadMediaFiles();
  }, []);

  const loadMediaFiles = async () => {
    try {
      // Fetch actual media files from Supabase Storage
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.warn('Could not list storage buckets:', bucketsError);
        setMediaFiles([]);
        setLoading(false);
        return;
      }

      const mediaFilesList: MediaFile[] = [];
      
      // Check for media-files bucket
      const mediaFilesBucket = buckets?.find(b => b.name === 'media-files');
      
      if (mediaFilesBucket) {
        const { data: files, error: filesError } = await supabase.storage
          .from('media-files')
          .list('', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (!filesError && files) {
          // Transform storage files to MediaFile format
          const transformedFiles = files.map((file) => {
            const { data: urlData } = supabase.storage
              .from('media-files')
              .getPublicUrl(file.name);

            return {
              id: file.name,
              name: file.name,
              originalName: file.name,
              type: file.metadata?.mimetype || 'unknown',
              mimeType: file.metadata?.mimetype || 'unknown',
              size: file.metadata?.size || 0,
              url: urlData.publicUrl,
              thumbnailUrl: urlData.publicUrl,
              status: 'pending' as const,
              uploadedAt: file.created_at || new Date().toISOString(),
              uploadedBy: 'unknown',
              uploader: {
                id: 'unknown',
                username: 'Unknown User',
                avatar_url: null
              }
            };
          });

          mediaFilesList.push(...transformedFiles);
        }
      }

      setMediaFiles(mediaFilesList);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast({
        title: "Error loading media files",
        description: error instanceof Error ? error.message : "Failed to load pending media files",
        variant: "destructive",
      });
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const moderateFile = async (fileId: string, approved: boolean, reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('moderate-media', {
        body: {
          fileId,
          approved,
          reason
        }
      });

      if (error) throw error;

      // Update local state
      setMediaFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, status: approved ? 'approved' : 'rejected', moderationReason: reason }
          : file
      ));

      toast({
        title: approved ? "Media approved" : "Media rejected",
        description: `File has been ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Error moderating file:', error);
      toast({
        title: "Moderation failed",
        description: "Failed to moderate media file",
        variant: "destructive",
      });
    }
  };

  const bulkModerate = async (approved: boolean) => {
    if (selectedFiles.length === 0) return;

    try {
      const promises = selectedFiles.map(fileId => 
        moderateFile(fileId, approved, moderationReason)
      );
      
      await Promise.all(promises);
      
      setSelectedFiles([]);
      setModerationReason('');
      
      toast({
        title: "Bulk moderation completed",
        description: `${selectedFiles.length} files ${approved ? 'approved' : 'rejected'}`,
      });
    } catch (error) {
      console.error('Error in bulk moderation:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100  } ${  sizes[i]}`;
  };

  const pendingFiles = mediaFiles.filter(file => file.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Moderation Queue</h2>
          <p className="text-muted-foreground">
            Review and moderate uploaded media files
          </p>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2">
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              className="w-64 h-20"
            />
            <Button
              onClick={() => bulkModerate(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve ({selectedFiles.length})
            </Button>
            <Button
              onClick={() => bulkModerate(false)}
              variant="destructive"
            >
              <X className="w-4 h-4 mr-2" />
              Reject ({selectedFiles.length})
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {pendingFiles.map((file) => {
            const FileIcon = getFileIcon(file.mimeType);
            
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(prev => [...prev, file.id]);
                            } else {
                              setSelectedFiles(prev => prev.filter(id => id !== file.id));
                            }
                          }}
                          className="rounded"
                        />
                        
                        <FileIcon className="w-8 h-8 text-muted-foreground" />
                        
                        <div>
                          <CardTitle className="text-base">{file.originalName}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>{file.mimeType}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={file.uploader?.avatar_url} />
                          <AvatarFallback>
                            {file.uploader?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{file.uploader?.username}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        
                        <Button
                          onClick={() => moderateFile(file.id, true)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        
                        <Button
                          onClick={() => moderateFile(file.id, false, 'Manual rejection')}
                          variant="destructive"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                    
                    {file.thumbnailUrl && (
                      <div className="flex justify-center">
                        <img
                          src={file.thumbnailUrl}
                          alt={file.originalName}
                          className="max-w-full h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    
                    {file.moderationReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Rejection Reason</p>
                            <p className="text-sm text-red-700">{file.moderationReason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {pendingFiles.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending media files</h3>
              <p className="text-muted-foreground">
                All media files have been reviewed and moderated.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
