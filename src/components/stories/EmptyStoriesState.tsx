import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, Sparkles, Users, MapPin } from 'lucide-react';

interface EmptyStoriesStateProps {
  onCreateStory?: () => void;
}

export const EmptyStoriesState: React.FC<EmptyStoriesStateProps> = ({ onCreateStory }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-primary/40 rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3 
            }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">No Stories Yet</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Be the first to share your story! Capture moments, places, and experiences 
            that matter to you and your community.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-4 h-4 text-primary" />
              </div>
              <span>Share photos and videos</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span>Tag your location</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <span>Connect with your community</span>
            </div>
          </div>

          {onCreateStory && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Button 
                onClick={onCreateStory}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Camera className="w-5 h-5 mr-2" />
                Create Your First Story
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};