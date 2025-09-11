import { markModule } from '@/debug/module-dupe-check';

// Mark module load for debugging
markModule('ABTestContext-v14');
console.log('[TRACE] ABTestContext-v14 file start');

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

// Pure type exports - no React API calls during module initialization
export const ABTEST_CONTEXT_NAME = 'abtest-context-v14';