import React, { useState, useCallback } from 'react';
import { useMediaLibrary, type MediaItem } from '@/hooks/useMediaLibrary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Trash2, Search, Tag, Loader2, Edit, Copy, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

export const MediaLibraryPanel: React.FC = () => {
  const { t } = useTranslation('admin');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const { mediaItems, isLoading, uploadMedia, updateMedia, deleteMedia, bulkDeleteMedia, isUploading } = useMediaLibrary(searchTerm, selectedTags);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => uploadMedia(file));
  }, [uploadMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] },
    disabled: isUploading,
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleBulkDelete = () => {
    const itemsToDelete = mediaItems?.filter(item => selectedItems.has(item.id)) || [];
    bulkDeleteMedia(itemsToDelete);
    setSelectedItems(new Set());
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Extract all unique tags
  const allTags = Array.from(new Set(mediaItems?.flatMap(item => item.tags || []) || []));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="h-8 w-8" />
          Media Library
        </h2>
        <p className="text-muted-foreground mt-2">
          Upload and manage your site's images and media files
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
          <CardDescription>Drag and drop files or click to browse</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            )}
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here...' : 'Drag & drop media files'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse (PNG, JPG, GIF, SVG, WEBP)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename, alt text, or caption..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {selectedItems.size > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedItems.size})
              </Button>
            )}
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <Tag className="h-5 w-5 text-muted-foreground" />
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaItems?.map((item) => (
          <Card key={item.id} className="overflow-hidden group relative">
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedItems.has(item.id)}
                onCheckedChange={() => toggleSelection(item.id)}
                className="bg-background"
              />
            </div>
            <div className="aspect-square bg-muted relative overflow-hidden">
              <img
                src={item.file_url}
                alt={item.alt_text || item.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium truncate" title={item.filename}>
                {item.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEditingItem(item)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => copyToClipboard(item.file_url)}
                >
                  {copiedUrl === item.file_url ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => deleteMedia(item)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Media</DialogTitle>
              <DialogDescription>Update media metadata and tags</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alt_text">Alt Text</Label>
                <Input
                  id="alt_text"
                  defaultValue={editingItem.alt_text || ''}
                  onBlur={(e) => updateMedia({ id: editingItem.id, alt_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  defaultValue={editingItem.caption || ''}
                  onBlur={(e) => updateMedia({ id: editingItem.id, caption: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  defaultValue={editingItem.tags?.join(', ') || ''}
                  onBlur={(e) => {
                    const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    updateMedia({ id: editingItem.id, tags });
                  }}
                  placeholder="landscape, nature, outdoor"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
