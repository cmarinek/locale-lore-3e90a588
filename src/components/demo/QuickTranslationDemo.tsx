import React from 'react';
import { useCommonTranslations } from '@/hooks/useCommonTranslations';
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
  const {
    save,
    cancel,
    edit,
    search,
    loading,
    enterEmail,
    enterPassword,
    signIn,
    signUp,
    t
  } = useCommonTranslations();

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">
        {t('translationDemo', 'common', 'Translation Demo')}
      </h2>
      
      {/* Common buttons */}
      <div className="flex gap-2">
        <Button>{save}</Button>
        <Button variant="outline">{cancel}</Button>
        <Button variant="ghost">{edit}</Button>
      </div>

      {/* Form inputs with translated placeholders */}
      <div className="space-y-2">
        <Input placeholder={enterEmail} />
        <Input type="password" placeholder={enterPassword} />
      </div>

      {/* Auth buttons */}
      <div className="flex gap-2">
        <Button className="flex-1">{signIn}</Button>
        <Button variant="outline" className="flex-1">{signUp}</Button>
      </div>

      {/* Search with translated placeholder */}
      <Input placeholder={search} />

      {/* Loading state */}
      <div className="text-center text-muted-foreground">
        {loading}
      </div>

      <Button onClick={onClose} variant="outline" className="w-full">
        {t('close')}
      </Button>
    </div>
  );
};