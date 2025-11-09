import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BatchedQuery {
  id: string;
  query: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export const useBatchedQuery = () => {
  const batchQueueRef = useRef<BatchedQuery[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const BATCH_DELAY = 50; // 50ms batching window

  const executeBatch = useCallback(async () => {
    if (batchQueueRef.current.length === 0) return;

    const batch = [...batchQueueRef.current];
    batchQueueRef.current = [];

    // Execute all queries in parallel
    const results = await Promise.allSettled(
      batch.map(item => item.query())
    );

    // Resolve or reject each promise
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        batch[index].resolve(result.value);
      } else {
        batch[index].reject(result.reason);
      }
    });
  }, []);

  const scheduleBatch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeBatch();
    }, BATCH_DELAY);
  }, [executeBatch]);

  const addToBatch = useCallback(<T>(query: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random()}`;
      batchQueueRef.current.push({ id, query, resolve, reject });
      scheduleBatch();
    });
  }, [scheduleBatch]);

  return { addToBatch };
};

// Helper to batch multiple Supabase queries
export const createBatchedSupabaseQuery = () => {
  const batchQueue: Array<{
    query: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  let batchTimer: NodeJS.Timeout | null = null;
  const BATCH_WINDOW = 50; // ms

  const executeBatch = async () => {
    if (batchQueue.length === 0) return;

    const batch = [...batchQueue];
    batchQueue.length = 0;

    // Execute all queries in parallel
    await Promise.all(
      batch.map(async (item) => {
        try {
          const result = await item.query();
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      })
    );
  };

  const addQuery = <T>(query: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      batchQueue.push({ query, resolve, reject });

      if (batchTimer) {
        clearTimeout(batchTimer);
      }

      batchTimer = setTimeout(() => {
        executeBatch();
      }, BATCH_WINDOW);
    });
  };

  return { addQuery };
};
