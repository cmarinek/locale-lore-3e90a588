import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface OptimisticUpdateOptions<T> {
  onUpdate: () => void;
  onRevert: () => void;
  serverUpdate: () => Promise<T>;
  successMessage?: string;
  errorMessage?: string;
  silent?: boolean;
}

export const useOptimisticUpdate = <T = void>() => {
  const [isPending, setIsPending] = useState(false);

  const execute = useCallback(async ({
    onUpdate,
    onRevert,
    serverUpdate,
    successMessage,
    errorMessage,
    silent = false,
  }: OptimisticUpdateOptions<T>): Promise<T | null> => {
    // Apply optimistic update immediately
    onUpdate();
    setIsPending(true);

    try {
      // Perform server update
      const result = await serverUpdate();
      
      if (!silent && successMessage) {
        toast.success(successMessage);
      }
      
      setIsPending(false);
      return result;
    } catch (error) {
      // Revert on error
      onRevert();
      setIsPending(false);
      
      if (!silent) {
        toast.error(errorMessage || 'Failed to save changes. Please try again.');
      }
      
      console.error('Optimistic update failed:', error);
      return null;
    }
  }, []);

  return { execute, isPending };
};
