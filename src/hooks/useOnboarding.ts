import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';

const ONBOARDING_STORAGE_KEY = 'localelore_onboarding_completed';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboardingStatus = () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      const userKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
      const userCompleted = localStorage.getItem(userKey);

      // Show onboarding if neither global nor user-specific flag is set
      if (!completed && !userCompleted) {
        setShowOnboarding(true);
      }
      
      setIsLoading(false);
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_STORAGE_KEY}_${user.id}`, 'true');
    }
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    skipOnboarding,
  };
};
