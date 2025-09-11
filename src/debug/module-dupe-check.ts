const globalKey = '__LL_MODULE_LOADS__';

type Tracker = { counts: Record<string, number> };

function getTracker(): Tracker {
  // @ts-ignore
  if (!globalThis[globalKey]) {
    // @ts-ignore
    globalThis[globalKey] = { counts: {} };
  }
  // @ts-ignore
  return globalThis[globalKey];
}

export function markModule(moduleName: string): void {
  if (!import.meta.env.DEV) return;
  
  const tracker = getTracker();
  tracker.counts[moduleName] = (tracker.counts[moduleName] || 0) + 1;
  
  console.log(`[MODULE-TRACE] ${moduleName} loaded ${tracker.counts[moduleName]} times`);
  
  if (tracker.counts[moduleName] > 1) {
    console.warn(`[DUP-MODULE] ${moduleName} loaded ${tracker.counts[moduleName]} times - potential duplication!`);
    console.trace(`Duplicate load stack for ${moduleName}`);
  }
}

export function getModuleStats(): Record<string, number> {
  return getTracker().counts;
}