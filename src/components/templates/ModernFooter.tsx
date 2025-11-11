import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle2, TrendingUp, Mail, Heart } from 'lucide-react';
import { useBranding } from '@/components/providers/BrandingProvider';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';
import { cn } from '@/lib/utils';

interface ModernFooterProps {
  totalStories?: number;
  verifiedStories?: number;
  trendingStories?: number;
  isMapPage?: boolean;
}

export const ModernFooter: React.FC<ModernFooterProps> = ({
  totalStories = 0,
  verifiedStories = 0,
  trendingStories = 0,
  isMapPage = false
}) => {
  const { branding, isLoading } = useBranding();
  const showStats = isMapPage && totalStories > 0;

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Stats Section - Only show on map pages */}
        {showStats && (
          <div className="mb-8 pb-8 border-b border-border/30">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {/* Total Stories */}
              <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {totalStories.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Total Stories</p>
                </div>
              </div>

              {/* Verified Stories */}
              <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 hover:from-success/20 hover:to-success/10 transition-all duration-300 hover:scale-105 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
                    {verifiedStories.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Verified</p>
                </div>
              </div>

              {/* Trending Stories */}
              {trendingStories > 0 && (
                <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-warning/10 to-warning/5 hover:from-warning/20 hover:to-warning/10 transition-all duration-300 hover:scale-105 cursor-default animate-fade-in">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent">
                      {trendingStories.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">Trending</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-3">
            {isLoading ? (
              <>
                <EnhancedSkeleton className="w-8 h-7" showShimmer={false} />
                <EnhancedSkeleton className="w-32 h-5" showShimmer={false} />
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <img 
                    src={branding?.logo_url || '/icon-192.png'} 
                    alt={branding?.site_name || 'LocaleLore'} 
                    className="w-8 h-7 object-contain" 
                  />
                  <span className="font-bold text-lg bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
                    {branding?.site_name || 'LocaleLore'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
                  Discover fascinating local stories and facts from around the world
                </p>
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground mb-1">Quick Links</h3>
            <nav className="flex flex-col items-center gap-2 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Privacy Policy
              </Link>
              <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 duration-200">
                Refund Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3 className="text-sm font-semibold text-foreground mb-1">Get in Touch</h3>
            <a 
              href="mailto:contact@localelore.com" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Contact Us</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {branding?.site_name || 'LocaleLore'}. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-destructive fill-destructive animate-pulse" />
            <span>for storytellers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
