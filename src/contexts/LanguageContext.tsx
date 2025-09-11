import React from 'react';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';

// Simplified context to provide language data without complex state management
export const useLanguage = () => {
  return {
    currentLanguage: 'en' as const,
    setLanguage: async (language: string) => {
      console.log('Language change disabled');
    },
    isRTL: false,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading: false,
  };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};