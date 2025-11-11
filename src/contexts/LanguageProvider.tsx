import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage, updateDocumentDirection } from '@/utils/languages';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const { i18n, ready } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Wait for i18n to be ready before proceeding
  if (!ready || !i18n) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Safely get current language with fallback
  const currentLanguage: SupportedLanguage = (i18n?.language?.split('-')[0] as SupportedLanguage) || 'en';
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    if (!i18n) {
      console.error('i18n not initialized');
      return;
    }
    
    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
      updateDocumentDirection(language);
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [i18n]);

  useEffect(() => {
    // Set initial direction
    if (currentLanguage) {
      updateDocumentDirection(currentLanguage);
    }
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};