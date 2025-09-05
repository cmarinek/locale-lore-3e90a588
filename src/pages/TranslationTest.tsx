import React from 'react';
import { TranslationTest as TranslationTestComponent } from '@/components/test/TranslationTest';
import { MainLayout } from '@/components/templates/MainLayout';

export default function TranslationTest() {
  return (
    <MainLayout>
      <TranslationTestComponent />
    </MainLayout>
  );
}