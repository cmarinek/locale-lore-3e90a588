import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout';
import { DiscussionThread } from '@/components/verification/DiscussionThread';
import { SwipeToVote } from '@/components/verification/SwipeToVote';
import { ReputationDisplay } from '@/components/verification/ReputationDisplay';
import { SocialSharing } from '@/components/social/SocialSharing';
import { RelatedFacts } from '@/components/facts/RelatedFacts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Flag,
  CheckCircle,
  AlertCircle,
  Tag,
  Link as LinkIcon,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Fact {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  vote_count_up: number;
  vote_count_down: number;
  status: 'pending' | 'verified' | 'rejected' | 'disputed';
  media_urls?: string[];
  author_id: string;
  category_id: string;
  verified_by?: string;
  tags?: string[];
  source_url?: string;
  time_period?: string;
  view_count?: number;
  profiles: {
    id: string;
    username: string;
    avatar_url?: string;
    reputation_score: number;
  };
  categories: {
    slug: string;
    icon: string;
    color: string;
  };
}

export const Fact: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [fact, setFact] = useState<Fact | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadFact();
      if (user) {
        checkUserVote();
        checkIfSaved();
      }
    }
  }, [id, user]);

  const loadFact = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facts')
        .select(`
          *,
          profiles!facts_author_id_fkey(
            id,
            username,
            avatar_url,
            reputation_score
          ),
          categories!facts_category_id_fkey(
            slug,
            icon,
            color
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setFact(data);

      // Increment view count (fire and forget - don't wait for response)
      if (data?.id) {
        supabase.rpc('increment_fact_view_count', { fact_id: data.id })
          .then(({ data: newCount }) => {
            // Update local state with new view count
            if (newCount !== null) {
              setFact(prev => prev ? { ...prev, view_count: newCount } : null);
            }
          })
          .catch(err => console.warn('Failed to increment view count:', err));
      }
    } catch (error) {
      console.error('Error loading fact:', error);
      toast({
        title: "Error loading fact",
        description: "The fact you're looking for might not exist",
        variant: "destructive"
      });
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVote = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('votes')
        .select('is_upvote')
        .eq('user_id', user.id)
        .eq('fact_id', id)
        .single();

      if (data) {
        setUserVote(data.is_upvote);
      }
    } catch (error) {
      // No vote found, which is fine
    }
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('saved_facts')
        .select('id')
        .eq('user_id', user.id)
        .eq('fact_id', id)
        .single();

      setIsSaved(!!data);
    } catch (error) {
      // Not saved, which is fine
    }
  };

  const handleVote = async (isUpvote: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote on facts",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('process-vote', {
        body: {
          fact_id: id,
          user_id: user.id,
          is_upvote: isUpvote
        }
      });

      if (error) throw error;

      setUserVote(isUpvote);
      
      // Update local vote counts
      if (fact) {
        setFact({
          ...fact,
          vote_count_up: isUpvote 
            ? fact.vote_count_up + (userVote === true ? 0 : 1)
            : fact.vote_count_up - (userVote === true ? 1 : 0),
          vote_count_down: !isUpvote 
            ? fact.vote_count_down + (userVote === false ? 0 : 1)
            : fact.vote_count_down - (userVote === false ? 1 : 0)
        });
      }

      toast({
        title: isUpvote ? "Upvoted!" : "Downvoted!",
        description: "Your vote has been recorded",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Vote failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save facts",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from('saved_facts')
          .delete()
          .eq('user_id', user.id)
          .eq('fact_id', id);
        
        setIsSaved(false);
        toast({
          title: "Fact removed from saved",
        });
      } else {
        await supabase
          .from('saved_facts')
          .insert({
            user_id: user.id,
            fact_id: id
          });
        
        setIsSaved(true);
        toast({
          title: "Fact saved!",
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Save failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const shareContent = fact ? {
    title: fact.title,
    description: fact.description,
    url: `${window.location.origin}/fact/${fact.id}`,
    image: fact.media_urls?.[0]
  } : null;

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading fact...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!fact) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Fact not found</h2>
            <p className="text-muted-foreground mb-4">The fact you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/explore')}>
              Return to Explore
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-8 bg-card/50 backdrop-blur">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <Badge
                      variant={fact.status === 'verified' ? 'default' : 'secondary'}
                      className={
                        fact.status === 'verified' 
                          ? 'bg-green-500/20 text-green-700 border-green-200' 
                          : fact.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-700 border-yellow-200'
                          : 'bg-red-500/20 text-red-700 border-red-200'
                      }
                    >
                      {fact.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {fact.status === 'pending' && <Eye className="w-3 h-3 mr-1" />}
                      {fact.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {fact.status.charAt(0).toUpperCase() + fact.status.slice(1)}
                    </Badge>
                    
                    <Badge
                      variant="outline"
                      style={{ 
                        backgroundColor: `${fact.categories.color  }20`,
                        borderColor: `${fact.categories.color  }40`
                      }}
                    >
                      {fact.categories.icon} {fact.categories.slug}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                    {fact.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {fact.location_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(fact.created_at), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      by {fact.profiles.username}
                    </div>
                  </div>

                  {/* Metadata Section */}
                  {(fact.time_period || fact.source_url || (fact.tags && fact.tags.length > 0)) && (
                    <div className="mb-8 p-4 border border-border rounded-lg bg-muted/30 space-y-4">
                      {/* Time Period */}
                      {fact.time_period && (
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-sm text-muted-foreground mb-1">Time Period</div>
                            <div className="text-base">{fact.time_period}</div>
                          </div>
                        </div>
                      )}

                      {/* Source URL */}
                      {fact.source_url && (
                        <div className="flex items-start gap-3">
                          <LinkIcon className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-muted-foreground mb-1">Source</div>
                            <a
                              href={fact.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline break-all flex items-center gap-2"
                            >
                              <img
                                src={`https://www.google.com/s2/favicons?domain=${new URL(fact.source_url).hostname}&sz=16`}
                                alt=""
                                className="w-4 h-4"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              {new URL(fact.source_url).hostname}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {fact.tags && fact.tags.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Tag className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-muted-foreground mb-2">Tags</div>
                            <div className="flex flex-wrap gap-2">
                              {fact.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                                  onClick={() => navigate(`/search?tag=${encodeURIComponent(tag)}`)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media */}
                  {fact.media_urls && fact.media_urls.length > 0 && (
                    <div className="mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fact.media_urls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`${fact.title} - Image ${index + 1}`}
                            className="rounded-lg object-cover w-full h-64"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="prose prose-lg max-w-none mb-8 text-foreground">
                    <p className="whitespace-pre-wrap">{fact.description}</p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        {fact.vote_count_up}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-muted-foreground">Comments</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Eye className="w-4 h-4" />
                        {fact.view_count || 0}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        className={isSaved ? 'text-primary' : ''}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </Button>
                      {shareContent && (
                        <SocialSharing
                          content={shareContent}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      )}
                      <Button variant="ghost" size="sm">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Discussion Thread */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8"
              >
                <DiscussionThread factId={fact.id} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-6">
                {/* Author Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur">
                    <h3 className="font-semibold mb-4">About the Author</h3>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={fact.profiles.avatar_url} />
                        <AvatarFallback>
                          {fact.profiles.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{fact.profiles.username}</h4>
                        <ReputationDisplay 
                          userId={fact.profiles.id}
                          compact
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 w-full"
                          onClick={() => navigate(`/profile/${fact.profiles.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Voting */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur">
                    <h3 className="font-semibold mb-4">Community Verification</h3>
                    <SwipeToVote
                      factId={fact.id}
                      currentVote={userVote}
                    />
                  </Card>
                </motion.div>

                {/* Location Map */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="p-6 bg-card/50 backdrop-blur">
                    <h3 className="font-semibold mb-4">Location</h3>
                    <div
                      className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => navigate(`/map?lat=${fact.latitude}&lng=${fact.longitude}&zoom=15&factId=${fact.id}`)}
                    >
                      <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000(${fact.longitude},${fact.latitude})/${fact.longitude},${fact.latitude},14,0/400x300@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`}
                        alt={`Map showing ${fact.location_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4">
                      <p className="font-medium">{fact.location_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {fact.latitude.toFixed(4)}, {fact.longitude.toFixed(4)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => navigate(`/map?lat=${fact.latitude}&lng=${fact.longitude}&zoom=15&factId=${fact.id}`)}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        View on Map
                      </Button>
                    </div>
                  </Card>
                </motion.div>

                {/* Related Facts */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <RelatedFacts
                    factId={fact.id}
                    latitude={fact.latitude}
                    longitude={fact.longitude}
                    categoryId={fact.category_id}
                    tags={fact.tags}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};