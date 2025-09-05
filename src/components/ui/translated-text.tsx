import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  i18nKey: string;
  namespace?: string;
  defaultValue?: string;
  values?: Record<string, any>;
  className?: string;
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  namespace = 'common',
  defaultValue,
  values,
  className,
  as: Component = 'span'
}) => {
  const { t } = useTranslation(namespace);
  
  const translatedText = t(i18nKey, { 
    defaultValue: defaultValue || i18nKey,
    ...values 
  });

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};