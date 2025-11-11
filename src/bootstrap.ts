import { initI18n } from '@/utils/i18n';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@/utils/monitoring';

/**
 * Bootstrap critical services BEFORE React renders
 * This ensures all services are ready and prevents race conditions
 */
export async function bootstrap(): Promise<void> {
  console.log('[Bootstrap] Starting application initialization...');
  
  try {
    // 1. Initialize i18n first (critical for rendering)
    console.log('[Bootstrap] Initializing i18n...');
    await initI18n();
    console.log('[Bootstrap] i18n initialized successfully');
    
    // 2. Initialize error tracking (non-blocking)
    console.log('[Bootstrap] Initializing error tracking...');
    initializeErrorTracking();
    
    // 3. Initialize performance monitoring (non-blocking)
    console.log('[Bootstrap] Initializing performance monitoring...');
    initializePerformanceMonitoring();
    
    console.log('[Bootstrap] Application initialization complete');
  } catch (error) {
    console.error('[Bootstrap] Critical initialization error:', error);
    // Allow app to continue even if initialization fails
  }
}
