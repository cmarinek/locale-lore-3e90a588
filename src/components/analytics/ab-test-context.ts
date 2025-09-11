import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ABTestContext-v6');
console.log('[TRACE] ABTestContext-v6 file start');

export interface ABTest {
  name: string;
  variants: string[];
  trafficSplit: Record<string, number>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  conversionGoal: string;
}

export interface ABTestContextType {
  getVariant: (testName: string) => string;
  trackConversion: (testName: string, conversionValue?: number) => void;
  isInTest: (testName: string) => boolean;
}

console.log('[TRACE] Before createContext in ABTestContext');

// Lazy context creation to avoid TDZ issues
let _abTestContext: React.Context<ABTestContextType | null> | null = null;

function getABTestContext() {
  if (!_abTestContext) {
    console.log('[TRACE] Creating ABTestContext lazily');
    _abTestContext = React.createContext<ABTestContextType | null>(null);
  }
  return _abTestContext;
}

export const ABTestContext = new Proxy({} as React.Context<ABTestContextType | null>, {
  get(target, prop) {
    return getABTestContext()[prop as keyof React.Context<ABTestContextType | null>];
  }
});

console.log('[TRACE] After createContext in ABTestContext');

export const useABTest = () => {
  console.log('[TRACE] useABTest invoked; typeof ABTestContext =', typeof ABTestContext);
  const context = React.useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};