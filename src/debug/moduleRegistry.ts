// Temporary debugging helper for module duplication detection
export const moduleLoadSet = new Set<string>();

export function markModuleLoad(moduleId: string) {
  moduleLoadSet.add(moduleId);
  console.log('[TRACE] Module loaded:', moduleId, 'Total unique modules:', moduleLoadSet.size);
  
  if (moduleLoadSet.size > 1 && moduleId.includes('AuthContext')) {
    console.warn('[DUP-MODULE] Potential AuthContext duplication detected');
  }
}