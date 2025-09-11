import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage, updateDocumentDirection } from '@/utils/languages';
import { LanguageContextType, LANGUAGE_CONTEXT_NAME } from './language-context';
import { createContextSafely } from '@/lib/context-registry';

// Mark module load for debugging
markModule('LanguageProvider-v14');
console.log('[TRACE] LanguageProvider-v14 file start');

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  console.log('[TRACE] LanguageProvider component initializing');
  
  // Create context safely using registry
  const LanguageContext = createContextSafely<LanguageContextType | null>(LANGUAGE_CONTEXT_NAME, null);
  
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  
  const detectedLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLanguage = (SUPPORTED_LANGUAGES[detectedLanguage as SupportedLanguage] ? detectedLanguage : 'en') as SupportedLanguage;
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

  console.log('[TRACE] LanguageProvider rendering with value:', { currentLanguage, isRTL, isLoading });

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export hook from here
export const useLanguage = () => {
  const LanguageContext = createContextSafely<LanguageContextType | null>(LANGUAGE_CONTEXT_NAME, null);
  const context = React.useContext(LanguageContext);
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