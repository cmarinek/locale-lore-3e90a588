import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentLanguage: SupportedLanguage = (i18n.language?.split('-')[0] as SupportedLanguage) || 'en';
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;

  const setLanguage = async (language: SupportedLanguage) => {
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
  };

  useEffect(() => {
    // Set initial direction
    updateDocumentDirection(currentLanguage);
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