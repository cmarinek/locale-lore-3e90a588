import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface TranslationDebugContextType {
  debugMode: boolean;
  toggleDebugMode: () => void;
  missingKeys: Set<string>;
  addMissingKey: (key: string, namespace: string) => void;
}

export const TranslationDebugContext = createContext<TranslationDebugContextType | undefined>(undefined);

export const TranslationDebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [debugMode, setDebugMode] = useState(() => {
    return localStorage.getItem('translation-debug-mode') === 'true';
  });
  const [missingKeys, setMissingKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('translation-debug-mode', debugMode.toString());
  }, [debugMode]);

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  const addMissingKey = (key: string, namespace: string) => {
    const fullKey = `${namespace}:${key}`;
    setMissingKeys(prev => new Set(prev).add(fullKey));
  };

  return (
    <TranslationDebugContext.Provider value={{ debugMode, toggleDebugMode, missingKeys, addMissingKey }}>
      {children}
    </TranslationDebugContext.Provider>
  );
};

export const useTranslationDebug = () => {
  const context = useContext(TranslationDebugContext);
  if (!context) {
    throw new Error('useTranslationDebug must be used within TranslationDebugProvider');
  }
  return context;
};

export const useDebugTranslation = (namespace: string = 'common') => {
  const { t, i18n } = useTranslation(namespace);
  const debug = useContext(TranslationDebugContext);

  const debugT = (key: string, options?: any) => {
    const translation = t(key, options);
    
    // Check if translation is missing (returns the key itself)
    if (debug?.debugMode && (translation === key || translation === `${namespace}:${key}`)) {
      debug.addMissingKey(key, namespace);
    }
    
    return translation;
  };

  return { t: debugT, i18n, debugMode: debug?.debugMode };
};
