import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { ModernFooter } from '@/components/templates/ModernFooter';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';
import { FeedbackWidget } from '@/components/support/FeedbackWidget';
import { useBranding } from '@/components/providers/BrandingProvider';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  totalStories?: number;
  verifiedStories?: number;
  trendingStories?: number;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  totalStories,
  verifiedStories,
  trendingStories
}) => {
  const { t, i18n } = useTranslation('navigation');
  const { branding, isLoading } = useBranding();
  const location = useLocation();
  
  // Get language info directly from i18n - no context dependency
  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;
  
  // Check if current page is a full-height map page
  const isMapPage = ['/map', '/explore', '/hybrid'].includes(location.pathname);
  
  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-300",
      isRTL && "rtl",
      className
    )}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4">
          {/* Main Header Row */}
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo + Breadcrumbs */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link to="/" className="flex items-center gap-2 shrink-0">
                {isLoading ? (
                  <>
                    <EnhancedSkeleton className="w-10 h-8" showShimmer={false} />
                    <EnhancedSkeleton className="w-32 h-6 hidden sm:block" showShimmer={false} />
                  </>
                ) : (
                  <>
                    <img 
                      src={branding?.logo_url || '/icon-192.png'} 
                      alt={branding?.site_name || 'LocaleLore'} 
                      className="w-10 h-8 object-contain" 
                    />
                    <span className="hidden lg:inline font-bold text-xl bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
                      {branding?.site_name || 'LocaleLore'}
                    </span>
                  </>
                )}
              </Link>
              
              {/* Breadcrumbs - Desktop Only */}
              <div className="hidden md:block border-l border-border/30 pl-4 min-w-0">
                <Breadcrumb />
              </div>
            </div>

            {/* Center: View Mode Toggle */}
            <div className="hidden lg:flex flex-1 justify-center max-w-md">
              <ViewModeToggle compact className="w-full max-w-xs" />
            </div>

            {/* Right: Navigation and Language Selector */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <Navigation />
              <LanguageSelector variant="compact" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative" style={{ padding: 0 }}>
        {children}
      </main>

      {/* Modern Footer */}
      <div className={cn(
        "mb-20 md:mb-0 safe-area-padding-bottom",
        isMapPage ? "mt-0" : "mt-12"
      )}>
        <ModernFooter 
          totalStories={totalStories}
          verifiedStories={verifiedStories}
          trendingStories={trendingStories}
          isMapPage={isMapPage}
        />
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {/* Feedback Widget - Always Visible */}
      <FeedbackWidget />
    </div>
  );
};