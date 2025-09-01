
import { toast } from 'sonner';

export const handleApiError = (error: any): void => {
  console.error('API Error:', error);
  
  if (error?.message) {
    toast.error(error.message);
  } else if (typeof error === 'string') {
    toast.error(error);
  } else {
    toast.error('An unexpected error occurred');
  }
};

export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    if (errorMessage) {
      toast.error(errorMessage);
    } else {
      handleApiError(error);
    }
    return null;
  }
};

export const debounceApiCall = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T => {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }) as T;
};
