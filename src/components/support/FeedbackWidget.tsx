import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  X,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface FeedbackWidgetProps {
  className?: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ className }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'suggestion'>('positive');
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    try {
      setLoading(true);
      
      const feedbackData = {
        feedback_type: feedbackType,
        message: feedback.trim(),
        rating: rating,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        user_id: user?.id || null
      };

      const { error } = await supabase
        .from('user_feedback')
        .insert([feedbackData]);

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setFeedback('');
      setRating(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className="w-80 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quick Feedback</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Help us improve your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type of feedback</label>
            <div className="flex gap-2">
              <Button
                variant={feedbackType === 'positive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('positive')}
                className="flex-1"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Positive
              </Button>
              <Button
                variant={feedbackType === 'negative' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('negative')}
                className="flex-1"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Issue
              </Button>
              <Button
                variant={feedbackType === 'suggestion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedbackType('suggestion')}
                className="flex-1"
              >
                💡
                Idea
              </Button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rate your experience</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-4 w-4 ${
                      rating && star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">Your feedback</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={submitFeedback}
            disabled={loading || !feedback.trim()}
            className="w-full"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Feedback
          </Button>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Your feedback helps us improve. {user ? 'Submitted as signed-in user.' : 'Submit anonymously.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};