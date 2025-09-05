import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation(ns);
  
  const translatedText = t(k, { 
    defaultValue: fallback || k,
    ...values 
  });

  if (children) {
    return <>{children}</>;
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