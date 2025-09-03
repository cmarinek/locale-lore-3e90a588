
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  Copy, 
  Trophy, 
  Star,
  Download,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  earned_at: string;
}

interface SocialSharingProps {
  achievement?: Achievement;
  level?: {
    level: number;
    title: string;
    points: number;
  };
  milestone?: {
    type: string;
    value: number;
    description: string;
  };
  className?: string;
}

export const SocialSharing: React.FC<SocialSharingProps> = ({
  achievement,
  level,
  milestone,
  className
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  const generateShareText = () => {
    if (achievement) {
      return `🎉 Just earned the "${achievement.name}" achievement on LocaleLore! ${achievement.description}`;
    }
    if (level) {
      return `🎯 Level Up! I just reached ${level.title} (Level ${level.level}) with ${level.points.toLocaleString()} points on LocaleLore!`;
    }
    if (milestone) {
      return `🌟 Milestone achieved! ${milestone.description} on LocaleLore! #LocaleExplorer`;
    }
    return 'Check out my progress on LocaleLore! 🗺️';
  };

  const generateShareUrl = () => {
    const baseUrl = 'https://localelore.app';
    if (achievement) {
      return `${baseUrl}/achievements/${achievement.id}`;
    }
    return baseUrl;
  };

  const shareText = generateShareText();
  const shareUrl = generateShareUrl();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Share text has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnPlatform = (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct web sharing, so we copy to clipboard
        copyToClipboard();
        toast({
          title: "Ready for Instagram!",
          description: "Text copied to clipboard. Paste it in your Instagram story or post.",
        });
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const generateShareImage = async () => {
    setIsGeneratingImage(true);
    
    // Mock image generation - in real app, use canvas or service like Bannerbear
    setTimeout(() => {
      setIsGeneratingImage(false);
      toast({
        title: "Share image ready!",
        description: "Your achievement image has been generated.",
      });
    }, 2000);
  };

  const ShareCard = () => (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-border/50">
      <CardHeader className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="mx-auto mb-4"
        >
          {achievement && (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg"
              style={{ backgroundColor: achievement.badge_color }}
            >
              {achievement.icon}
            </div>
          )}
          {level && (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-white shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          )}
          {milestone && (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-white shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
          )}
        </motion.div>
        
        <CardTitle className="text-xl">
          {achievement && achievement.name}
          {level && `${level.title} Achieved!`}
          {milestone && 'Milestone Reached!'}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground">
          {achievement && achievement.description}
          {level && `Level ${level.level} with ${level.points.toLocaleString()} points`}
          {milestone && milestone.description}
        </p>
        
        <Badge variant="secondary" className="mx-auto">
          LocaleLore Explorer
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center text-xs text-muted-foreground">
          Earned on {achievement?.earned_at ? new Date(achievement.earned_at).toLocaleDateString() : new Date().toLocaleDateString()}
        </div>
        
        {/* Platform buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => shareOnPlatform('twitter')}
            className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
          >
            <Twitter className="w-4 h-4" />
            Twitter
          </Button>
          
          <Button
            onClick={() => shareOnPlatform('facebook')}
            className="flex items-center gap-2 bg-[#4267B2] hover:bg-[#365899] text-white"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
          
          <Button
            onClick={() => shareOnPlatform('instagram')}
            className="flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90 text-white"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>
        </div>
        
        {/* Generate image button */}
        <Button
          onClick={generateShareImage}
          disabled={isGeneratingImage}
          className="w-full flex items-center gap-2"
          variant="secondary"
        >
          {isGeneratingImage ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              Generate Share Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className={className}>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Achievement
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Achievement
            </DialogTitle>
          </DialogHeader>
          <ShareCard />
        </DialogContent>
      </Dialog>
    </div>
  );
};
