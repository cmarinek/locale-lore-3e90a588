
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Flag, Edit, BarChart3 } from 'lucide-react';
import { MediaUploadZone } from '@/components/media/MediaUploadZone';
import { MediaModerationQueue } from '@/components/media/MediaModerationQueue';
import { MediaEditor } from '@/components/media/MediaEditor';
import { MediaAnalytics } from '@/components/media/MediaAnalytics';
import { useAuth } from '@/contexts/AuthProvider';

const MediaManagement: React.FC = () => {
  const { user } = useAuth();
  const [selectedImageForEditing, setSelectedImageForEditing] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Media Management</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive media handling with AI-powered moderation and editing tools
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
              <MediaUploadZone
                onUploadComplete={(files) => {
                  console.log('Uploaded files:', files);
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <MediaModerationQueue />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            {selectedImageForEditing ? (
              <MediaEditor
                imageUrl={selectedImageForEditing}
                onSave={(editedUrl) => {
                  console.log('Edited image:', editedUrl);
                  setSelectedImageForEditing(null);
                }}
                onCancel={() => setSelectedImageForEditing(null)}
              />
            ) : (
              <Card className="p-8 text-center">
                <Edit className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Media Editor</h3>
                <p className="text-muted-foreground mb-4">
                  Select an image from the moderation queue or upload a new one to start editing
                </p>
                <button
                  onClick={() => setSelectedImageForEditing('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800')}
                  className="text-primary hover:underline"
                >
                  Try with sample image
                </button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MediaAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MediaManagement;
