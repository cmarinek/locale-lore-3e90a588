
import React, { useState, useEffect, useContext } from 'react';
import { analytics } from '@/utils/analytics-engine';

interface ABTest {
  name: string;
  variants: string[];
  trafficSplit: Record<string, number>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  conversionGoal: string;
}

interface ABTestContext {
  getVariant: (testName: string) => string;
  trackConversion: (testName: string, conversionValue?: number) => void;
  isInTest: (testName: string) => boolean;
}

const ABTestContext = React.createContext<ABTestContext | null>(null);

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

interface ABTestProviderProps {
  children: React.ReactNode;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children }) => {
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [userVariants, setUserVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchActiveTests();
    loadUserVariants();
  }, []);

  const fetchActiveTests = async () => {
    try {
      const response = await fetch('/api/ab-tests/active');
      const tests = await response.json();
      setActiveTests(tests);
    } catch (error) {
      console.error('Failed to fetch active tests:', error);
    }
  };

  const loadUserVariants = () => {
    const stored = localStorage.getItem('ab-test-variants');
    if (stored) {
      setUserVariants(JSON.parse(stored));
    }
  };

  const saveUserVariants = (variants: Record<string, string>) => {
    localStorage.setItem('ab-test-variants', JSON.stringify(variants));
    setUserVariants(variants);
  };

  const getVariant = (testName: string): string => {
    // Return cached variant if exists
    if (userVariants[testName]) {
      return userVariants[testName];
    }

    // Find active test
    const test = activeTests.find(t => t.name === testName && t.isActive);
    if (!test) {
      return 'control'; // Default variant
    }

    // Assign user to variant based on traffic split
    const variant = assignVariant(test);
    
    // Cache the assignment
    const newVariants = { ...userVariants, [testName]: variant };
    saveUserVariants(newVariants);

    // Track exposure
    analytics.trackABTest(testName, variant, false);

    return variant;
  };

  const assignVariant = (test: ABTest): string => {
    const random = Math.random();
    let cumulative = 0;

    for (const [variant, split] of Object.entries(test.trafficSplit)) {
      cumulative += split;
      if (random <= cumulative) {
        return variant;
      }
    }

    return test.variants[0]; // Fallback to first variant
  };

  const trackConversion = (testName: string, conversionValue?: number) => {
    const variant = userVariants[testName];
    if (variant) {
      analytics.trackABTest(testName, variant, true);
      
      // Track conversion value if provided
      if (conversionValue !== undefined) {
        analytics.trackRevenue(conversionValue, 'USD', 'ab_test_conversion', {
          testName,
          variant,
        });
      }
    }
  };

  const isInTest = (testName: string): boolean => {
    return activeTests.some(t => t.name === testName && t.isActive);
  };

  const contextValue: ABTestContext = {
    getVariant,
    trackConversion,
    isInTest,
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

// Hook for feature flags and A/B testing
export const useFeatureFlag = (flagName: string, defaultValue: boolean = false): boolean => {
  const { getVariant, isInTest } = useABTest();
  
  if (!isInTest(flagName)) {
    return defaultValue;
  }
  
  const variant = getVariant(flagName);
  return variant === 'enabled' || variant === 'treatment';
};

// Component for A/B test variants
interface ABTestVariantProps {
  testName: string;
  variant: string;
  children: React.ReactNode;
}

export const ABTestVariant: React.FC<ABTestVariantProps> = ({
  testName,
  variant,
  children,
}) => {
  const { getVariant } = useABTest();
  const currentVariant = getVariant(testName);
  
  if (currentVariant === variant) {
    return <>{children}</>;
  }
  
  return null;
};

// Higher-order component for A/B testing
export const withABTest = <P extends object>(
  Component: React.ComponentType<P>,
  testName: string,
  variants: Record<string, React.ComponentType<P>>
) => {
  return (props: P) => {
    const { getVariant } = useABTest();
    const variant = getVariant(testName);
    
    const VariantComponent = variants[variant] || Component;
    return <VariantComponent {...props} />;
  };
};
