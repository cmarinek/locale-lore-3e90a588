
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Story, QuickCaptureData } from '@/types/stories';
import { VerticalFeed } from '@/components/stories/VerticalFeed';
import { QuickCapture } from '@/components/stories/QuickCapture';
import { TrendingSection } from '@/components/stories/TrendingSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAnimations } from '@/hooks/useAnimations';
import { 
  Plus, 
  TrendingUp, 
  Compass, 
  Clock,
  Camera
} from 'lucide-react';

const Stories: React.FC = () => {
  const { user } = useAuth();
  const { pageVariants } = useAnimations();
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'discover'>('feed');
  const [showCapture, setShowCapture] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for development
  const mockStories: Story[] = [
    {
      id: '1',
      user_id: 'user1',
      title: 'Amazing sunset at the beach',
      content: 'Just witnessed the most incredible sunset! The colors were absolutely breathtaking. Nature never fails to amaze me 🌅',
      media_urls: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop'],
      media_type: 'image',
      location_name: 'Malibu Beach, California',
      latitude: 34.0259,
      longitude: -118.7798,
      hashtags: ['sunset', 'beach', 'malibu', 'nature', 'photography'],
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      view_count: 1247,
      like_count: 89,
      comment_count: 23,
      is_trending: true,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user1',
        username: 'beachexplorer',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '2',
      user_id: 'user2',
      title: 'Hidden waterfall discovery',
      content: 'Found this incredible hidden waterfall during my hike today! Sometimes the best discoveries happen when you take the path less traveled 💦',
      media_urls: [
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop'
      ],
      media_type: 'carousel',
      location_name: 'Yosemite National Park',
      latitude: 37.7749,
      longitude: -119.4194,
      hashtags: ['waterfall', 'hiking', 'yosemite', 'nature', 'adventure'],
      expires_at: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
      view_count: 856,
      like_count: 124,
      comment_count: 34,
      is_trending: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user2',
        username: 'trailblazer_sam',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: '3',
      user_id: 'user3',
      title: 'Street art masterpiece',
      content: 'This incredible mural just appeared overnight! The artist captured the spirit of our neighborhood perfectly 🎨',
      media_urls: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=600&fit=crop'],
      media_type: 'video',
      location_name: 'Mission District, San Francisco',
      latitude: 37.7599,
      longitude: -122.4148,
      hashtags: ['streetart', 'mural', 'sanfrancisco', 'art', 'urban'],
      expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      view_count: 2134,
      like_count: 456,
      comment_count: 78,
      is_trending: true,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user3',
        username: 'urban_explorer',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c5?w=150&h=150&fit=crop&crop=face'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStories(mockStories);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setStories([...mockStories]);
    setLoading(false);
  };

  const handleLoadMore = () => {
    // Simulate loading more stories
    console.log('Loading more stories...');
  };

  const handleSubmitStory = async (data: QuickCaptureData) => {
    console.log('Submitting story:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add new story to the beginning
    const newStory: Story = {
      id: `new-${Date.now()}`,
      user_id: user?.id || 'current-user',
      title: data.caption.split('\n')[0] || 'New Story',
      content: data.caption,
      media_urls: [URL.createObjectURL(data.media)],
      media_type: data.mediaType,
      location_name: data.location?.name,
      latitude: data.location?.latitude,
      longitude: data.location?.longitude,
      hashtags: data.hashtags,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      is_trending: false,
      created_at: new Date().toISOString(),
      author: {
        id: user?.id || 'current-user',
        username: user?.user_metadata?.username || 'you',
        avatar_url: user?.user_metadata?.avatar_url
      }
    };

    setStories(prev => [newStory, ...prev]);
  };

  const handleStoryClick = (story: Story) => {
    // Find the story index and switch to feed view
    const storyIndex = stories.findIndex(s => s.id === story.id);
    if (storyIndex !== -1) {
      setActiveTab('feed');
      // TODO: Set current story index in feed
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading Stories...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-background"
    >
      <Helmet>
        <title>Stories - Awesome Facts</title>
        <meta name="description" content="Share and discover amazing stories and moments" />
      </Helmet>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="h-screen">
        <div className="hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="feed" className="h-full m-0">
          <VerticalFeed
            stories={stories}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="trending" className="h-full m-0 p-4">
          <TrendingSection
            stories={stories}
            onStoryClick={handleStoryClick}
          />
        </TabsContent>

        <TabsContent value="discover" className="h-full m-0 p-4">
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Compass className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Discover Amazing Stories</h3>
              <p className="text-muted-foreground mb-6">
                Explore stories from around the world and find inspiration
              </p>
              <Button onClick={() => setActiveTab('trending')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                View Trending
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Navigation tabs - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-40 md:hidden">
        <div className="flex items-center justify-around py-2">
          <Button
            variant={activeTab === 'discover' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('discover')}
            className="flex flex-col gap-1"
          >
            <Compass className="w-5 h-5" />
            <span className="text-xs">Discover</span>
          </Button>

          <Button
            variant={activeTab === 'feed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('feed')}
            className="flex flex-col gap-1"
          >
            <Clock className="w-5 h-5" />
            <span className="text-xs">Stories</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCapture(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full w-12 h-12"
          >
            <Camera className="w-6 h-6" />
          </Button>

          <Button
            variant={activeTab === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trending')}
            className="flex flex-col gap-1"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Trending</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCapture(true)}
            className="flex flex-col gap-1"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Create</span>
          </Button>
        </div>
      </div>

      {/* Floating action button - Desktop */}
      <div className="hidden md:block fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          onClick={() => setShowCapture(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full shadow-lg"
        >
          <Camera className="w-6 h-6 mr-2" />
          Create Story
        </Button>
      </div>

      {/* Quick capture modal */}
      <QuickCapture
        isOpen={showCapture}
        onClose={() => setShowCapture(false)}
        onSubmit={handleSubmitStory}
      />
    </motion.div>
  );
};

export default Stories;
