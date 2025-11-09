/**
 * Request Deduplication System
 * Prevents multiple identical API calls from executing simultaneously
 * by sharing the same promise for duplicate requests
 */

type PendingRequest = {
  promise: Promise<any>;
  timestamp: number;
  subscribers: number;
};

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_TTL = 5000; // 5 seconds

  /**
   * Execute a request with deduplication
   * If an identical request is already in flight, return the existing promise
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    
    if (pending) {
      console.log(`[Dedupe] Reusing pending request for: ${key}`);
      pending.subscribers++;
      return pending.promise;
    }

    // Execute new request
    console.log(`[Dedupe] Executing new request for: ${key}`);
    const promise = requestFn()
      .finally(() => {
        // Clean up after request completes
        setTimeout(() => {
          const current = this.pendingRequests.get(key);
          if (current && current.promise === promise) {
            this.pendingRequests.delete(key);
          }
        }, this.CACHE_TTL);
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
      subscribers: 1,
    });

    return promise;
  }

  /**
   * Create a deduped version of a Supabase query
   */
  dedupeQuery<T>(queryBuilder: any, key?: string): Promise<T> {
    const dedupeKey = key || this.generateKey(queryBuilder);
    
    return this.dedupe(dedupeKey, async () => {
      const { data, error } = await queryBuilder;
      if (error) throw error;
      return data;
    });
  }

  /**
   * Generate a unique key from a query builder
   */
  private generateKey(queryBuilder: any): string {
    // Try to extract query details for key generation
    const url = queryBuilder.url?.toString() || '';
    const method = queryBuilder.method || 'GET';
    return `${method}:${url}`;
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
  }

  /**
   * Get stats about deduplication
   */
  getStats() {
    const requests = Array.from(this.pendingRequests.values());
    const totalSubscribers = requests.reduce((sum, req) => sum + req.subscribers, 0);
    const savedRequests = totalSubscribers - requests.length;

    return {
      pendingRequests: requests.length,
      totalSubscribers,
      savedRequests,
      deduplicationRate: totalSubscribers > 0 ? (savedRequests / totalSubscribers) * 100 : 0,
    };
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Hook for using request deduplication in components
 */
export function useRequestDeduplication() {
  return {
    dedupe: requestDeduplicator.dedupe.bind(requestDeduplicator),
    dedupeQuery: requestDeduplicator.dedupeQuery.bind(requestDeduplicator),
    getStats: requestDeduplicator.getStats.bind(requestDeduplicator),
  };
}
