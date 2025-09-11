import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { initI18n } from '@/utils/i18n';
import { SUPPORTED_LANGUAGES, isRTLLanguage, updateDocumentDirection } from '@/utils/languages';
import type { SupportedLanguage } from '@/utils/languages';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        console.log('[LanguageProvider] Initializing i18n...');
        await initI18n();
        const lang = (i18n.language || 'en') as SupportedLanguage;
        setCurrentLanguage(lang);
        updateDocumentDirection(lang);
        console.log('[LanguageProvider] i18n initialized with language:', lang);
      } catch (error) {
        console.error('[LanguageProvider] Failed to initialize i18n:', error);
        setCurrentLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeI18n();
  }, [i18n]);

  const changeLanguage = async (language: SupportedLanguage) => {
    const supportedCodes = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];
    if (supportedCodes.includes(language)) {
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);
      updateDocumentDirection(language);
      localStorage.setItem('locale-lore-language', language);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isRTL: isRTLLanguage(currentLanguage),
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};