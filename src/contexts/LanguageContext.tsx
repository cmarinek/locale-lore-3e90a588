import React from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, updateDocumentDirection } from '@/utils/languages';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | null>(null);

// Optional hook - app should work without this context
export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return fallback values instead of throwing error
    console.warn('useLanguage called outside LanguageProvider, using fallback values');
    return {
      currentLanguage: 'en' as SupportedLanguage,
      setLanguage: async (language: SupportedLanguage) => {
        console.log('Fallback setLanguage called with:', language);
      },
      isRTL: false,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isLoading: false,
    };
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('LanguageProvider: Rendering...');
  
  // Simplified implementation without useState for now
  const contextValue: LanguageContextType = {
    currentLanguage: 'en',
    setLanguage: async (language: SupportedLanguage) => {
      console.log('Language change requested:', language);
      updateDocumentDirection(language);
    },
    isRTL: false,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading: false,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};