import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface QuickTranslationDemoProps {
  onClose: () => void;
}

/**
 * Demo component showing how to use translations efficiently
 * This serves as a reference for other developers
 */
export const QuickTranslationDemo: React.FC<QuickTranslationDemoProps> = ({ onClose }) => {
  const { t } = useTranslation('common');

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">
        {t('translationDemo', 'Translation Demo')}
      </h2>
      
      {/* Common buttons */}
      <div className="flex gap-2">
        <Button>{t('save', 'Save')}</Button>
        <Button variant="outline">{t('cancel', 'Cancel')}</Button>
        <Button variant="ghost">{t('edit', 'Edit')}</Button>
      </div>

      {/* Form inputs with translated placeholders */}
      <div className="space-y-2">
        <Input placeholder={t('enterEmail', 'Enter your email')} />
        <Input type="password" placeholder={t('enterPassword', 'Enter your password')} />
      </div>

      {/* Auth buttons */}
      <div className="flex gap-2">
        <Button className="flex-1">{t('signIn', 'Sign In')}</Button>
        <Button variant="outline" className="flex-1">{t('signUp', 'Sign Up')}</Button>
      </div>

      {/* Search with translated placeholder */}
      <Input placeholder={t('search', 'Search...')} />

      {/* Loading state */}
      <div className="text-center text-muted-foreground">
        {t('loading', 'Loading...')}
      </div>

      <Button onClick={onClose} variant="outline" className="w-full">
        {t('close')}
      </Button>
    </div>
  );
};