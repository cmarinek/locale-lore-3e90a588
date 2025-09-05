import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { isRTL } = useLanguage();
  const { t } = useTranslation('navigation');

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
              <img src="/lovable-uploads/5729b722-5fd5-4d7d-b192-c6f4bd70ad99.png" alt="LocaleLore" className="w-8 h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                LocaleLore
              </span>
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
      <main className="relative min-h-[calc(100vh-16rem)] pb-28 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 py-8 mt-12 mb-20 md:mb-0 safe-area-padding-bottom">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/5729b722-5fd5-4d7d-b192-c6f4bd70ad99.png" alt="LocaleLore" className="w-5 h-5" />
              <span className="font-semibold">LocaleLore</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                {t('privacy')}
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                {t('terms')}
              </Link>
              <a 
                href="mailto:contact@localelore.com" 
                className="hover:text-primary transition-colors"
              >
                {t('contact')}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation />
    </div>
  );
};