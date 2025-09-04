
import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { LanguageSelector } from '@/components/ui/language-selector';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, className }) => {
  const { isRTL } = useLanguage();

  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-300",
      isRTL && "rtl",
      className
    )}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Star className="w-6 h-6 text-primary" />
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
      <main className="relative">
        {children}
      </main>
    </div>
  );
};
