import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  console.log('📄 INDEX: Component rendering...');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-radial opacity-10"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-logo-green rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-logo-blue-light rounded-full blur-3xl opacity-30 animate-pulse"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-logo-blue-light to-logo-green bg-clip-text text-transparent">
              LocaleLore
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            Discover amazing stories and facts from around the world. Connect with local knowledge and share your own discoveries.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/explore')}
              className="bg-white text-primary hover:bg-white/90 hover-scale elevation-2 px-8 py-4 text-lg font-semibold"
            >
              <Compass className="w-6 h-6 mr-2" />
              Start Exploring
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="border-white/30 text-white hover:bg-white/10 hover-scale backdrop-blur-md px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="p-8 text-center h-full glass elevation-3 hover-scale border-white/20">
              <div className="bg-gradient-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Discover</h3>
              <p className="text-white/80 text-lg">
                Find fascinating stories and facts from locations around the world.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card className="p-8 text-center h-full glass elevation-3 hover-scale border-white/20">
              <div className="bg-gradient-logo w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Explore</h3>
              <p className="text-white/80 text-lg">
                Navigate through interactive maps and discover local knowledge.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="p-8 text-center h-full glass elevation-3 hover-scale border-white/20">
              <div className="bg-gradient-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Share</h3>
              <p className="text-white/80 text-lg">
                Contribute your own stories and become part of the community.
              </p>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="glass elevation-2 rounded-2xl p-8 max-w-4xl mx-auto border-white/20">
            <h2 className="text-3xl font-bold text-white mb-8">Join Our Growing Community</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gradient-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">1K+</div>
                <div className="text-white/70">Contributors</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-logo w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">5K+</div>
                <div className="text-white/70">Stories</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-primary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">100+</div>
                <div className="text-white/70">Locations</div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-secondary w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">4.8</div>
                <div className="text-white/70">Rating</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating action elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="fixed bottom-8 right-8 z-20"
        >
          <Button
            onClick={() => navigate('/explore')}
            className="w-16 h-16 rounded-full bg-gradient-logo hover-scale elevation-3 shadow-2xl"
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;