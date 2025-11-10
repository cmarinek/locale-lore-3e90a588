import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';
import { FeedbackWidget } from '@/components/support/FeedbackWidget';
import { useBranding } from '@/components/providers/BrandingProvider';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { t, i18n } = useTranslation('navigation');
  const { branding, isLoading } = useBranding();
  
  // Get language info directly from i18n - no context dependency
  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;
  
  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-300",
      isRTL && "rtl",
      className
    )}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <EnhancedSkeleton className="w-10 h-8" showShimmer={false} />
                  <EnhancedSkeleton className="w-32 h-6" showShimmer={false} />
                </>
              ) : (
                <>
                  <img 
                    src={branding?.logo_url || '/icon-192.png'} 
                    alt={branding?.site_name || 'LocaleLore'} 
                    className="w-10 h-8 object-contain" 
                  />
                  <span className="font-bold text-xl bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
                    {branding?.site_name || 'LocaleLore'}
                  </span>
                </>
              )}
            </Link>

            {/* Navigation and Language Selector */}
            <div className="flex items-center gap-4">
              <Navigation />
              <LanguageSelector variant="compact" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8 mt-12 mb-20 md:mb-0 safe-area-padding-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <EnhancedSkeleton className="w-6 h-5" showShimmer={false} />
                  <EnhancedSkeleton className="w-24 h-4" showShimmer={false} />
                </>
              ) : (
                <>
                  <img 
                    src={branding?.logo_url || '/icon-192.png'} 
                    alt={branding?.site_name || 'LocaleLore'} 
                    className="w-6 h-5 object-contain" 
                  />
                  <span className="font-semibold bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
                    {branding?.site_name || 'LocaleLore'}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="hover:text-primary transition-colors">
                Refund Policy
              </Link>
              <a 
                href="mailto:contact@localelore.com" 
                className="hover:text-primary transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
      
      {/* Feedback Widget - Always Visible */}
      <FeedbackWidget />
    </div>
  );
};