
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'default',
  className,
  showLabel = true
}) => {
  const { t } = useTranslation('common');
  const { currentLanguage, setLanguage, supportedLanguages, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await setLanguage(languageCode as any);
    }
    setIsOpen(false);
  };

  const currentLang = supportedLanguages[currentLanguage] || supportedLanguages.en;

  if (variant === 'minimal') {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="h-8 px-2"
        >
          <span className="text-lg">{currentLang?.flag || '🌐'}</span>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="p-2 min-w-[200px] bg-popover border shadow-lg">
                <div className="space-y-1">
                  {Object.values(supportedLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      disabled={isLoading}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        currentLanguage === lang.code && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.nativeName}</span>
                      {currentLanguage === lang.code && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant={variant === 'compact' ? 'ghost' : 'outline'}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2",
          variant === 'compact' ? "h-9 px-3" : "h-10 px-4"
        )}
      >
        {variant !== 'compact' && <Globe className="w-4 h-4" />}
        <span className="text-lg">{currentLang?.flag || '🌐'}</span>
        {showLabel && (
          <span className="hidden sm:inline">
            {variant === 'compact' ? currentLang?.code?.toUpperCase() || 'EN' : currentLang?.nativeName || 'English'}
          </span>
        )}
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 z-50"
          >
            <Card className="p-3 min-w-[280px] bg-popover border shadow-lg">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {t('selectLanguage')}
                </h3>
                {Object.values(supportedLanguages).map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLanguageSelect(lang.code)}
                    disabled={isLoading}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      currentLanguage === lang.code && "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-muted-foreground">{lang.name}</div>
                    </div>
                    {currentLanguage === lang.code && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-background/50 rounded-md flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
