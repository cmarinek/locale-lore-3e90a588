import React, { useEffect, useState, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage, updateDocumentDirection } from '@/utils/languages';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Optional hook - app should work without this context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return fallback values instead of throwing error
    console.warn('useLanguage called outside LanguageProvider, using fallback values');
    return {
      currentLanguage: 'en' as SupportedLanguage,
      setLanguage: async () => {},
      isRTL: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isLoading: false,
    };
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const currentLanguage = (i18n.language?.split('-')[0] || 'en') as SupportedLanguage;
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false;

  const setLanguage = async (language: SupportedLanguage): Promise<void> => {
    if (isLoading) return; // Prevent concurrent changes
    
    setIsLoading(true);
    try {
      await i18n.changeLanguage(language);
      updateDocumentDirection(language);
      
      // Store preference
      localStorage.setItem('locale-lore-language', language);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language, isRTL: SUPPORTED_LANGUAGES[language].rtl } 
      }));
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update document direction when language changes
  useEffect(() => {
    updateDocumentDirection(currentLanguage);
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};