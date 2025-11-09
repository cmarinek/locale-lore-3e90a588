import { supabase } from '@/integrations/supabase/client';

interface BatchedRequest {
  key: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class BatchedApiClient {
  private queue: Map<string, BatchedRequest> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private readonly BATCH_WINDOW = 50; // 50ms window to collect requests

  /**
   * Add a request to the batch queue
   * Duplicate requests (same key) within the batch window will be deduplicated
   */
  addRequest<T>(key: string, execute: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // If request with same key exists, return the existing promise
      const existing = this.queue.get(key);
      if (existing) {
        return existing.resolve;
      }

      this.queue.set(key, {
        key,
        execute,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.executeBatch();
    }, this.BATCH_WINDOW);
  }

  private async executeBatch() {
    if (this.queue.size === 0) return;

    const batch = Array.from(this.queue.values());
    this.queue.clear();

    console.log(`[BatchedApi] Executing ${batch.length} batched requests`);

    // Execute all requests in parallel
    await Promise.all(
      batch.map(async (request) => {
        try {
          const result = await request.execute();
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      })
    );
  }

  /**
   * Clear the queue (useful for cleanup)
   */
  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue.clear();
  }
}

export const batchedApi = new BatchedApiClient();

// Example usage for batching Supabase queries:
// 
// const result = await batchedApi.addRequest('unique-key', async () => {
//   return await supabase.from('table').select('*');
// });

