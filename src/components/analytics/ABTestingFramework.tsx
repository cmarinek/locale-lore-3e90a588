// A/B Testing Framework - Updated to use context registry pattern
import React from 'react';

// Export the new context registry components
export { ABTestProvider, useABTest } from './ABTestProvider';

// Import for internal use
import { useABTest } from './ABTestProvider';

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