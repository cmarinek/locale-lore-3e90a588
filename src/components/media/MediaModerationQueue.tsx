
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Eye, Flag, AlertTriangle, Image, Video, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MediaFile } from '@/types/media';

export const MediaModerationQueue: React.FC = () => {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMediaFiles();
  }, [statusFilter, typeFilter]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('media_files')
        .select(`
          *,
          uploader:profiles!uploaded_by(username, avatar_url),
          moderator:profiles!moderated_by(username)
        `)
        .order('uploaded_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter) {
        query = query.like('mime_type', `${typeFilter}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setMediaFiles(data || []);
    } catch (error) {
      console.error('Error loading media files:', error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateFile = async (fileId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const { error } = await supabase.functions.invoke('moderate-media-action', {
        body: { fileId, action, reason }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Media ${action}d successfully`,
      });

      await loadMediaFiles();
    } catch (error) {
      console.error('Error moderating file:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} media`,
        variant: "destructive"
      });
    }
  };

  const bulkModerate = async (action: 'approve' | 'reject') => {
    if (selectedFiles.size === 0) return;

    try {
      const { error } = await supabase.functions.invoke('bulk-moderate-media', {
        body: { fileIds: Array.from(selectedFiles), action }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedFiles.size} files ${action}d successfully`,
      });

      setSelectedFiles(new Set());
      await loadMediaFiles();
    } catch (error) {
      console.error('Error in bulk moderation:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} files`,
        variant: "destructive"
      });
    }
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    return File;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      processing: 'bg-blue-500'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-500';
  };

  const filteredFiles = mediaFiles.filter(file =>
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.uploader?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Media Moderation Queue
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search files or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedFiles.size} files selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => bulkModerate('approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkModerate('reject')}
              >
                <X className="w-4 h-4 mr-1" />
                Reject All
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading media files...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No media files found
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.mime_type);
                return (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />

                      {/* File Preview */}
                      <div className="flex-shrink-0">
                        {file.thumbnail_url ? (
                          <img
                            src={file.thumbnail_url}
                            alt={file.original_name}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-20 h-20 border rounded flex items-center justify-center bg-muted">
                            <FileIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">{file.original_name}</h3>
                          <Badge className={`${getStatusBadge(file.status)} text-white`}>
                            {file.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><strong>Type:</strong> {file.mime_type}</p>
                            <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                          <div>
                            <p><strong>Uploader:</strong> {file.uploader?.username || 'Unknown'}</p>
                            <p><strong>Uploaded:</strong> {new Date(file.uploaded_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {file.moderation_reason && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-1 text-yellow-800">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">Moderation Note:</span>
                            </div>
                            <p className="text-sm text-yellow-700 mt-1">{file.moderation_reason}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        
                        {file.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => moderateFile(file.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => moderateFile(file.id, 'reject', 'Inappropriate content')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
