import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  Star,
  Eye,
  DollarSign,
  Plus,
  Lock,
  Unlock,
  FileText,
  Image,
  Video,
  Download,
  BarChart3,
  LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { PremiumContent } from '@/types/contributor';
import { toast } from '@/hooks/use-toast';

const getContentIcon = (type: string) => {
  switch (type) {
    case 'detailed_guide': return <FileText className="w-5 h-5" />;
    case 'exclusive_photos': return <Image className="w-5 h-5" />;
    case 'video_tour': return <Video className="w-5 h-5" />;
    case 'insider_tips': return <Star className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export const PremiumContentManager: React.FC = () => {
  const { user } = useAuth();
  const [premiumContent, setPremiumContent] = useState<PremiumContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPremiumContent();
    }
  }, [user]);

  const fetchPremiumContent = async () => {
    setLoading(true);
    if (!user) {
      setPremiumContent([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const normalized = (data ?? []).map((content) => ({
        ...content,
        price: Number(content.price),
        purchase_count: content.purchase_count ?? 0,
        rating: Number(content.rating ?? 0),
      }));

      setPremiumContent(normalized as PremiumContent[]);
    } catch (error) {
      console.error('Error fetching premium content:', error);
      toast({
        title: 'Unable to load premium content',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const totalRevenue = premiumContent.reduce((sum, content) => 
    sum + (content.purchase_count * content.price), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Content
          </h2>
          <p className="text-muted-foreground">
            Create exclusive content for your followers
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <CreatePremiumContentDialog 
            onCreated={() => {
              setShowCreateDialog(false);
              fetchPremiumContent();
            }} 
          />
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{premiumContent.length}</p>
                <p className="text-sm text-muted-foreground">Premium Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {premiumContent.reduce((sum, content) => sum + content.purchase_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {premiumContent.length > 0 
                    ? (premiumContent.reduce((sum, content) => sum + content.rating, 0) / premiumContent.length).toFixed(1)
                    : '0.0'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="guides">Detailed Guides</TabsTrigger>
          <TabsTrigger value="photos">Exclusive Photos</TabsTrigger>
          <TabsTrigger value="videos">Video Tours</TabsTrigger>
          <TabsTrigger value="tips">Insider Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {premiumContent.map((content) => (
              <PremiumContentCard 
                key={content.id} 
                content={content}
                onUpdate={fetchPremiumContent}
              />
            ))}
            
            {premiumContent.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No premium content yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start monetizing your expertise by creating premium content
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Content
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {['guides', 'photos', 'videos', 'tips'].map((type) => (
          <TabsContent key={type} value={type}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {premiumContent
                .filter(content => {
                  const typeMap: Record<string, string> = {
                    guides: 'detailed_guide',
                    photos: 'exclusive_photos',
                    videos: 'video_tour',
                    tips: 'insider_tips'
                  };
                  return content.content_type === typeMap[type];
                })
                .map((content) => (
                  <PremiumContentCard 
                    key={content.id} 
                    content={content}
                    onUpdate={fetchPremiumContent}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const PremiumContentCard: React.FC<{ 
  content: PremiumContent; 
  onUpdate: () => void;
}> = ({ content, onUpdate }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-blue-100 text-blue-600">
                {getContentIcon(content.content_type)}
              </div>
              <Badge variant="secondary" className="capitalize">
                {content.content_type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">
                ${content.price}
              </span>
            </div>
          </div>
          
          <CardTitle className="text-base line-clamp-2">
            {content.title}
          </CardTitle>
          
          {content.description && (
            <CardDescription className="line-clamp-2">
              {content.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold">{content.purchase_count}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  ${(content.purchase_count * content.price).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{content.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="w-3 h-3" />
              </Button>
            </div>

            {/* Quick Analytics */}
            {showAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-muted rounded-lg text-sm"
              >
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(content.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>{new Date(content.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion rate:</span>
                    <span>
                      {content.purchase_count > 0 ? '12.5%' : '0%'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreatePremiumContentDialog: React.FC<{ onCreated: () => void }> = ({ onCreated }) => {
  const [contentType, setContentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!contentType || !title || !price) return;

    setIsCreating(true);
    try {
      const { error } = await supabase.functions.invoke('create-premium-content', {
        body: {
          content_type: contentType,
          title,
          description,
          price: parseFloat(price),
        }
      });

      if (error) throw error;

      toast({
        title: "Premium content created",
        description: "Your content is now available for purchase.",
      });

      onCreated();
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create Premium Content</DialogTitle>
        <DialogDescription>
          Monetize your expertise with exclusive content
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content-type">Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="detailed_guide">Detailed Guide</SelectItem>
              <SelectItem value="exclusive_photos">Exclusive Photos</SelectItem>
              <SelectItem value="video_tour">Video Tour</SelectItem>
              <SelectItem value="insider_tips">Insider Tips</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g., Complete Guide to Hidden Gems in Central Park"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what makes this content special..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              id="price"
              type="number"
              placeholder="9.99"
              min="0.99"
              max="99.99"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button 
          onClick={handleCreate}
          disabled={!contentType || !title || !price || isCreating}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Premium Content"}
        </Button>
      </div>
    </DialogContent>
  );
};
