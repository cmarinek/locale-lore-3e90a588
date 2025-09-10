import React from 'react';

// Completely disable context API to prevent bundling issues
export const useLanguage = () => {
  return {
    currentLanguage: 'en' as const,
    setLanguage: async (language: string) => {
      console.log('Language change disabled');
    },
    isRTL: false,
    supportedLanguages: [],
    isLoading: false,
  };
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};