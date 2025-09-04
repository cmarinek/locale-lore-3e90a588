
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { QuickCaptureData } from '@/types/stories';
import { VerticalFeed } from '@/components/stories/VerticalFeed';
import { QuickCapture } from '@/components/stories/QuickCapture';
import { TrendingSection } from '@/components/stories/TrendingSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAnimations } from '@/hooks/useAnimations';
import { useStories } from '@/hooks/useStories';
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
  const [trendingStories, setTrendingStories] = useState<any[]>([]);
  
  const {
    stories,
    loading,
    submitting,
    fetchStories,
    fetchTrendingStories,
    createStory,
    trackView
  } = useStories();

  const handleRefresh = async () => {
    await fetchStories();
  };

  const handleLoadMore = () => {
    // TODO: Implement pagination
    console.log('Loading more stories...');
  };

  const handleSubmitStory = async (data: QuickCaptureData) => {
    try {
      await createStory(data);
      setShowCapture(false);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  // Load trending stories when tab changes
  useEffect(() => {
    if (activeTab === 'trending') {
      fetchTrendingStories().then(setTrendingStories);
    }
  }, [activeTab, fetchTrendingStories]);

  const handleStoryClick = (story: any) => {
    // Find the story index and switch to feed view
    const storyIndex = stories.findIndex(s => s.id === story.id);
    if (storyIndex !== -1) {
      setActiveTab('feed');
      // Track view when story is clicked
      trackView(story.id);
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
            stories={trendingStories}
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
