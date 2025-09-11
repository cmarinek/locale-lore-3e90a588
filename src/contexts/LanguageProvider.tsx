import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { markModule } from '@/debug/module-dupe-check';
import { SUPPORTED_LANGUAGES, SupportedLanguage, updateDocumentDirection } from '@/utils/languages';
import { LanguageContext, LanguageContextType } from './language-context';

// Mark module load for debugging
markModule('LanguageProvider-v6');
console.log('[TRACE] LanguageProvider-v6 file start');

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  console.log('[TRACE] LanguageProvider component initializing');
  
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