import React, { useState, useEffect } from 'react';
import { markModule } from '@/debug/module-dupe-check';
import { analytics } from '@/utils/analytics-engine';
import { ABTest, ABTestContextType, _setABTestContext } from './ab-test-context';

// Mark module load for debugging
markModule('ABTestProvider-v11');
console.log('[TRACE] ABTestProvider-v11 file start');

interface ABTestProviderProps {
  children: React.ReactNode;
}

// Create the actual context here where React is available
const ActualABTestContext = React.createContext<ABTestContextType | null>(null);

// Set the context reference
_setABTestContext(ActualABTestContext);

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children }) => {
  console.log('[TRACE] ABTestProvider component initializing');
  
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
      try {
        setUserVariants(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored variants:', error);
      }
    }
  };

  const saveUserVariants = (variants: Record<string, string>) => {
    localStorage.setItem('ab-test-variants', JSON.stringify(variants));
    setUserVariants(variants);
  };

  const assignVariant = (testName: string): string => {
    const test = activeTests.find(t => t.name === testName);
    if (!test || !test.isActive) {
      return 'control';
    }

    // Check if user already has a variant assigned
    if (userVariants[testName]) {
      return userVariants[testName];
    }

    // Assign variant based on traffic split
    const random = Math.random();
    let cumulative = 0;
    
    for (const [variant, split] of Object.entries(test.trafficSplit)) {
      cumulative += split;
      if (random <= cumulative) {
        const newVariants = { ...userVariants, [testName]: variant };
        saveUserVariants(newVariants);
        
        // Track assignment
        analytics.trackEngagement('ab_test_assigned', {
          test_name: testName,
          variant,
          timestamp: new Date().toISOString()
        });
        
        return variant;
      }
    }

    return 'control';
  };

  const getVariant = (testName: string): string => {
    return userVariants[testName] || assignVariant(testName);
  };

  const trackConversion = (testName: string, conversionValue?: number) => {
    const variant = getVariant(testName);
    
    analytics.trackEngagement('ab_test_conversion', {
      test_name: testName,
      variant,
      conversion_value: conversionValue,
      timestamp: new Date().toISOString()
    });
  };

  const isInTest = (testName: string): boolean => {
    const test = activeTests.find(t => t.name === testName);
    return test?.isActive || false;
  };

  const value: ABTestContextType = {
    getVariant,
    trackConversion,
    isInTest,
  };

  console.log('[TRACE] ABTestProvider rendering with value:', { activeTestsCount: activeTests.length });

  return (
    <ActualABTestContext.Provider value={value}>
      {children}
    </ActualABTestContext.Provider>
  );
};

// Export hook from here
export const useABTest = () => {
  if (!ActualABTestContext) {
    throw new Error('useABTest must be used within an ABTestProvider - context not initialized');
  }
  
  const context = React.useContext(ActualABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};