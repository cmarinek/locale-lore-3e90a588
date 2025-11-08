
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { SocialShareOptions } from '@/types/social';
import { log } from '@/utils/logger';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Copy,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialSharingProps {
  content: {
    title: string;
    description: string;
    url: string;
    image?: string;
  };
  trigger?: React.ReactNode;
  className?: string;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  content,
  trigger,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content.url);
      toast({
        title: "Link copied!",
        description: "Share this link anywhere you'd like.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  }, [content]);

  const shareToX = useCallback(() => {
    const text = encodeURIComponent(`${content.title}\n\n${content.description}`);
    const url = encodeURIComponent(content.url);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [content]);

  const shareToFacebook = useCallback(() => {
    const url = encodeURIComponent(content.url);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }, [content]);

  const shareToLinkedIn = useCallback(() => {
    const url = encodeURIComponent(content.url);
    const title = encodeURIComponent(content.title);
    const summary = encodeURIComponent(content.description);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
  }, [content]);

  const shareToInstagram = useCallback(() => {
    // Instagram doesn't support direct URL sharing, so we copy to clipboard
    copyToClipboard();
    toast({
      title: "Ready for Instagram!",
      description: "Link copied to clipboard. Paste it in your Instagram story or bio.",
    });
  }, [copyToClipboard]);

  const shareToWhatsApp = useCallback(() => {
    const text = encodeURIComponent(`${content.title}\n\n${content.description}\n\n${content.url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [content]);

  // Move icon references inside component with useMemo - v15
  const platforms = useMemo(() => [
    {
      name: 'X (Twitter)',
      icon: Twitter,
      action: shareToX,
      color: 'bg-black hover:bg-gray-800 text-white',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: shareToFacebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5] text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: shareToLinkedIn,
      color: 'bg-[#0A66C2] hover:bg-[#0958A5] text-white',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      action: shareToInstagram,
      color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: shareToWhatsApp,
      color: 'bg-[#25D366] hover:bg-[#20BA5A] text-white',
    },
  ], [shareToX, shareToFacebook, shareToLinkedIn, shareToInstagram, shareToWhatsApp]);

  const shareNatively = async () => {
    try {
      await navigator.share({
        title: content.title,
        text: content.description,
        url: content.url,
      });
      setIsOpen(false);
    } catch (error) {
      // User cancelled - don't show error for that
      if (error.name !== 'AbortError') {
        log.error('Failed to share content', error, { component: 'SocialSharing' });
        toast({
          title: "Sharing failed",
          description: "Please try again or use another sharing option.",
          variant: "destructive",
        });
      }
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share this discovery
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold text-sm mb-1">{content.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {content.description}
            </p>
          </div>

          {/* Platform buttons */}
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <motion.div
                key={platform.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={platform.action}
                  className={`w-full justify-start ${platform.color}`}
                  variant="default"
                >
                  <platform.icon className="w-4 h-4 mr-3" />
                  {platform.name}
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Utility buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            
            {navigator.share && (
              <Button
                onClick={shareNatively}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                More Options
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
