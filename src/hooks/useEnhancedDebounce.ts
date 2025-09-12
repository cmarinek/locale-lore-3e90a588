import { useState, useEffect, useCallback, useRef } from 'react';

interface UseEnhancedDebounceOptions {
  delay: number;
  immediate?: boolean;
  maxWait?: number;
}

export const useEnhancedDebounce = <T>(
  value: T, 
  options: UseEnhancedDebounceOptions
): [T, () => void, boolean] => {
  const { delay, immediate = false, maxWait } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(immediate ? value : value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const maxTimerRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>(0);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = undefined;
    }
    setIsDebouncing(false);
  }, []);

  useEffect(() => {
    const now = Date.now();
    lastCallTime.current = now;
    setIsDebouncing(true);

    // Set up regular debounce timer
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
      timerRef.current = undefined;
    }, delay);

    // Set up max wait timer if specified
    if (maxWait && !maxTimerRef.current) {
      maxTimerRef.current = setTimeout(() => {
        setDebouncedValue(value);
        setIsDebouncing(false);
        cancel();
      }, maxWait);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, maxWait, cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedValue, cancel, isDebouncing];
};

// Hook for debouncing function calls (not just values)
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: {
    maxWait?: number;
    leading?: boolean;
    trailing?: boolean;
  }
) => {
  const { maxWait, leading = false, trailing = true } = options || {};
  
  const timerRef = useRef<NodeJS.Timeout>();
  const maxTimerRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>(0);
  const lastArgs = useRef<Parameters<T>>();
  const [isPending, setIsPending] = useState(false);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = undefined;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    if (lastArgs.current) {
      const result = callback(...lastArgs.current);
      cancel();
      return result;
    }
  }, [callback, cancel]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime.current;
    
    lastArgs.current = args;
    lastCallTime.current = now;
    setIsPending(true);

    // Leading edge call
    if (leading && (!timerRef.current)) {
      const result = callback(...args);
      if (!trailing) {
        cancel();
      }
      return result;
    }

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set up new timer
    timerRef.current = setTimeout(() => {
      if (trailing) {
        callback(...args);
      }
      setIsPending(false);
      timerRef.current = undefined;
    }, delay);

    // Max wait timer
    if (maxWait && !maxTimerRef.current) {
      maxTimerRef.current = setTimeout(() => {
        callback(...args);
        cancel();
      }, maxWait);
    }
  }, [callback, delay, leading, trailing, maxWait, cancel]);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    callback: debouncedCallback as T,
    cancel,
    flush,
    isPending
  };
};