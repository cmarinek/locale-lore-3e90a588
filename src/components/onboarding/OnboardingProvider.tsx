import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingFlow } from './OnboardingFlow';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  return (
    <>
      {children}
      <OnboardingFlow
        open={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </>
  );
};
