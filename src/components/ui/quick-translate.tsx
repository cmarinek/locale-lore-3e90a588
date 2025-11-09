import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TranslationDebugContext } from '@/contexts/TranslationDebugContext';

interface TProps {
  k: string; // translation key
  ns?: string; // namespace 
  values?: Record<string, any>; // interpolation values
  fallback?: string; // fallback text
  children?: React.ReactNode; // optional children for complex content
}

/**
 * Quick translation component for rapid internationalization
 * Usage: <T k="welcome" ns="auth" fallback="Welcome!" />
 * Usage: <T k="itemCount" values={{ count: 5 }} />
 */
export const T: React.FC<TProps> = ({ 
  k, 
  ns = 'common', 
  values, 
  fallback, 
  children 
}) => {
  const { t, i18n } = useTranslation(ns);
  const debug = useContext(TranslationDebugContext);
  
  const translatedText = t(k, { 
    defaultValue: fallback || k,
    ...values 
  });

  // Check if translation is missing
  const isMissing = debug?.debugMode && (
    translatedText === k || 
    translatedText === `${ns}:${k}` ||
    translatedText === (fallback || k)
  );

  if (isMissing) {
    debug?.addMissingKey(k, ns);
  }

  if (children) {
    return <>{children}</>;
  }

  if (isMissing) {
    return (
      <span className="bg-destructive/20 text-destructive border-b-2 border-destructive px-1 rounded" title={`Missing: ${ns}:${k}`}>
        {translatedText}
      </span>
    );
  }

  return <>{translatedText}</>;
};

/**
 * Quick translation hook for getting translated strings in JS
 * Usage: const welcomeText = useT('welcome', 'auth', 'Welcome!');
 */
export const useT = (key: string, namespace = 'common', fallback?: string) => {
  const { t } = useTranslation(namespace);
  return t(key, { defaultValue: fallback || key });
};