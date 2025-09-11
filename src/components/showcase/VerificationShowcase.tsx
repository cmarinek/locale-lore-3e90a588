import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SwipeToVote } from '@/components/verification/SwipeToVote';
import { DiscussionThread } from '@/components/verification/DiscussionThread';
import { ReputationDisplay } from '@/components/verification/ReputationDisplay';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  ThumbsUp, 
  Shield, 
  Zap,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';

export const VerificationShowcase: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<'vote' | 'discussion' | 'reputation'>('vote');
  const [demoVote, setDemoVote] = useState<boolean | null>(null);

  // Move icon references inside component with useMemo - v15
  const features = useMemo(() => [
    {
      icon: Users,
      title: "Community Verification",
      description: "Crowdsourced fact-checking with sophisticated voting algorithms"
    },
    {
      icon: MessageSquare,
      title: "Threaded Discussions",
      description: "Nested comment system with real-time updates and voting"
    },
    {
      icon: Trophy,
      title: "Reputation System",
      description: "Gamified scoring with achievements and credibility indicators"
    },
    {
      icon: Shield,
      title: "Anti-Spam Protection",
      description: "Rate limiting and sophisticated abuse prevention"
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live vote updates with optimistic UI for instant feedback"
    },
    {
      icon: Award,
      title: "Achievement System",
      description: "Badges and milestones to encourage quality participation"
    }
  ], []);

  const demoFact = {
    id: 'demo-fact-1',
    title: 'The Great Library of Alexandria',
    description: 'The ancient Library of Alexandria was one of the largest and most significant libraries of the ancient world. It was part of the larger research institution called the Mouseion, which was dedicated to the Muses.',
    author: 'HistoryExplorer',
    location: 'Alexandria, Egypt',
    category: 'History',
    voteCount: { up: 1247, down: 23 },
    verificationLevel: 'Community Verified'
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Community Verification System
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A sophisticated voting and verification ecosystem with iOS-style interactions, 
            gamification elements, and community-driven quality control.
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-card via-card/90 to-primary/5 hover:to-primary/10 transition-all duration-300">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Interactive Demo */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/50">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Interactive Demo
            </h3>
            <p className="text-muted-foreground">
              Try out the verification system components below
            </p>
          </div>

          <Tabs value={selectedDemo} onValueChange={(value) => setSelectedDemo(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vote" className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Swipe Voting
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussion
              </TabsTrigger>
              <TabsTrigger value="reputation" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Reputation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vote" className="space-y-4">
              <Card className="p-6 bg-gradient-to-r from-background via-background/95 to-primary/5">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h4 className="font-semibold text-foreground">{demoFact.title}</h4>
                    <p className="text-sm text-muted-foreground">{demoFact.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="default" className="bg-blue-500/20 text-blue-600">
                        {demoFact.category}
                      </Badge>
                      <Badge variant="default" className="bg-green-500/20 text-green-600">
                        {demoFact.verificationLevel}
                      </Badge>
                    </div>
                  </div>

                  <SwipeToVote
                    factId={demoFact.id}
                    currentVote={demoVote}
                    onVoteChange={setDemoVote}
                    disabled={false}
                  />

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Swipe left to dispute • Swipe right to verify</p>
                    <p className="mt-1">Current votes: {demoFact.voteCount.up} verify, {demoFact.voteCount.down} dispute</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-foreground mb-2">Community Discussion</h4>
                <p className="text-sm text-muted-foreground">
                  Nested comments with voting and real-time updates
                </p>
              </div>
              <DiscussionThread factId={demoFact.id} />
            </TabsContent>

            <TabsContent value="reputation" className="space-y-4">
              <div className="text-center mb-4">
                <h4 className="font-semibold text-foreground mb-2">User Reputation & Achievements</h4>
                <p className="text-sm text-muted-foreground">
                  Gamified system with levels, achievements, and credibility scoring
                </p>
              </div>
              <ReputationDisplay showAchievements={true} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Technical Features */}
      <Card className="p-6 bg-gradient-to-br from-card to-primary/5">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground text-center">
            Technical Implementation
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Real-time Features
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Live vote updates with WebSocket connections</li>
                <li>• Optimistic UI for instant user feedback</li>
                <li>• Real-time comment notifications</li>
                <li>• Dynamic reputation score updates</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security & Anti-Spam
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Rate limiting per user and action type</li>
                <li>• Sophisticated reputation algorithms</li>
                <li>• Content moderation workflows</li>
                <li>• Abuse detection and prevention</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Gamification
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Progressive achievement system</li>
                <li>• Activity streaks and milestones</li>
                <li>• Reputation levels and badges</li>
                <li>• Community leaderboards</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Community Features
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Nested comment threading (3 levels deep)</li>
                <li>• Threaded discussions with voting</li>
                <li>• User credibility indicators</li>
                <li>• Verification evidence system</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-8 text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">
            Ready to Build Trust in Your Community?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Implement this sophisticated verification system in your application to build 
            trust, encourage quality content, and create an engaged community.
          </p>
          <div className="flex justify-center gap-4">
            <Button>View Documentation</Button>
            <Button variant="outline">See Source Code</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};