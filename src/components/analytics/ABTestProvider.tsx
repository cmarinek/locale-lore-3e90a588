import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { analytics } from '@/utils/analytics-engine';

interface ABTest {
  name: string;
  variants: string[];
  trafficSplit: Record<string, number>;
  enabled: boolean;
}

interface ABTestContextType {
  getVariant: (testName: string) => string;
  trackConversion: (testName: string, variant?: string) => void;
  isInTest: (testName: string) => boolean;
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined);

interface ABTestProviderProps {
  children: ReactNode;
}

export const ABTestProvider = ({ children }: ABTestProviderProps) => {
  const [userVariants, setUserVariants] = useState<Record<string, string>>({});

  const getVariant = (testName: string): string => {
    if (userVariants[testName]) {
      return userVariants[testName];
    }

    // Simple variant assignment based on user ID hash
    const hash = testName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const variant = Math.abs(hash) % 2 === 0 ? 'A' : 'B';
    
    setUserVariants(prev => ({ ...prev, [testName]: variant }));
    return variant;
  };

  const trackConversion = (testName: string, variant?: string) => {
    const actualVariant = variant || getVariant(testName);
    analytics.trackEngagement('ab_test_conversion', {
      test_name: testName,
      variant: actualVariant,
      timestamp: Date.now()
    });
  };

  const isInTest = (testName: string): boolean => {
    return Boolean(userVariants[testName]);
  };

  const value: ABTestContextType = {
    getVariant,
    trackConversion,
    isInTest,
  };

  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  );
};

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (context === undefined) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};