import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, MessageSquare, ThumbsUp, Calendar, MapPin, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { motion } from 'framer-motion';

interface Fact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  status: string;
  vote_count_up: number;
  vote_count_down: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  fact_id: string;
  facts: {
    title: string;
    location_name: string;
  };
}

export const UserContributions: React.FC = () => {
  const { user } = useAuth();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!user) return;

      try {
        // Fetch user's facts
        const { data: factsData, error: factsError } = await supabase
          .from('facts')
          .select('*')
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (factsError) throw factsError;

        // Fetch user's comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('fact_comments')
          .select(`
            *,
            facts (title, location_name)
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        setFacts(factsData || []);
        setComments(commentsData || []);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            My Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Contributions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="facts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="facts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Facts ({facts.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facts" className="space-y-4">
            {facts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No facts submitted yet</h3>
                <p className="text-muted-foreground">
                  Share your knowledge by submitting interesting facts about locations.
                </p>
              </div>
            ) : (
              facts.map((fact, index) => (
                <motion.div
                  key={fact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{fact.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {fact.location_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(fact.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(fact.status)}>
                      {fact.status}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3 line-clamp-2">
                    {fact.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      {fact.vote_count_up}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="w-4 h-4 text-red-600 rotate-180" />
                      {fact.vote_count_down}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                <p className="text-muted-foreground">
                  Join the conversation by commenting on interesting facts.
                </p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">
                        Comment on "{comment.facts?.title}"
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {comment.facts?.location_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">
                    {comment.content}
                  </p>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};