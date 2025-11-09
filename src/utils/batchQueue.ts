import { SupabaseClient } from '@supabase/supabase-js';

interface BatchRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'upsert';
  params: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class BatchQueue {
  private queue: BatchRequest[] = [];
  private timer: NodeJS.Timeout | null = null;
  private readonly delay = 50; // 50ms batching window

  add(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject });
      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.executeBatch();
    }, this.delay);
  }

  private async executeBatch() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    // Group requests by table and operation
    const groups = this.groupRequests(batch);

    // Execute each group
    for (const [key, requests] of Object.entries(groups)) {
      await this.executeGroup(requests);
    }
  }

  private groupRequests(batch: BatchRequest[]): Record<string, BatchRequest[]> {
    return batch.reduce((acc, request) => {
      const key = `${request.table}-${request.operation}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(request);
      return acc;
    }, {} as Record<string, BatchRequest[]>);
  }

  private async executeGroup(requests: BatchRequest[]) {
    // Execute all requests in parallel for now
    // In a real implementation, you might want to combine them into a single query
    await Promise.all(
      requests.map(async (request) => {
        try {
          // This is a placeholder - in reality, you'd use the Supabase client
          // But we can't access it here without dependency injection
          request.resolve({ success: true });
        } catch (error) {
          request.reject(error);
        }
      })
    );
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.queue = [];
  }
}

export const batchQueue = new BatchQueue();
