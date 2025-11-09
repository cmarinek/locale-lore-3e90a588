/**
 * Optimized Supabase Client
 * Wraps the standard client with request deduplication and smart prefetching
 */

import { supabase } from './client';
import { requestDeduplicator } from '@/utils/requestDeduplication';

/**
 * Create a deduped query that prevents identical requests from running simultaneously
 */
export function createDedupedQuery<T = any>(queryBuilder: any, key?: string) {
  return requestDeduplicator.dedupeQuery<T>(queryBuilder, key);
}

/**
 * Optimized wrapper around common Supabase patterns
 */
export const optimizedSupabase = {
  /**
   * Fetch with automatic deduplication
   */
  from: (table: any) => {
    const builder = supabase.from(table as any);
    
    return {
      select: (columns?: string) => {
        const selectBuilder = builder.select(columns as any);
        
        return {
          ...selectBuilder,
          /**
           * Execute with deduplication
           */
          deduped: (key?: string) => {
            const dedupeKey = key || `${table}:select:${columns || '*'}`;
            return createDedupedQuery(selectBuilder, dedupeKey);
          },
        };
      },
      // Pass through other methods
      insert: builder.insert.bind(builder),
      update: builder.update.bind(builder),
      upsert: builder.upsert.bind(builder),
      delete: builder.delete.bind(builder),
    };
  },

  /**
   * Get deduplication stats
   */
  getStats: () => requestDeduplicator.getStats(),
};

// Re-export the original client for non-optimized use cases
export { supabase };
