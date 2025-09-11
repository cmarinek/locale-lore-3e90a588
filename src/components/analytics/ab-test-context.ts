import React from 'react';
import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ABTestContext-v12');
console.log('[TRACE] ABTestContext-v12 file start');

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

// Create a placeholder that will be replaced by the actual context
export let ABTestContext: React.Context<ABTestContextType | null> = null as any;

// This will be called by the provider to set the actual context
export const _setABTestContext = (context: React.Context<ABTestContextType | null>) => {
  ABTestContext = context;
};