import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'localLore_onboarding_completed';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    
    if (!hasCompletedOnboarding && !showOnboarding) {
      // Show onboarding after a short delay for better UX
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array to run only once

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding
  };
}