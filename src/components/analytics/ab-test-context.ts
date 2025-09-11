import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ABTestContext-v5');
console.log('[TRACE] ABTestContext-v5 file start');

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
export const ABTestContext = React.createContext<ABTestContextType | null>(null);
console.log('[TRACE] After createContext in ABTestContext');

export const useABTest = () => {
  console.log('[TRACE] useABTest invoked; React available:', !!React, 'typeof ABTestContext =', typeof ABTestContext);
  const context = React.useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};