import { useState, useCallback } from 'react';

export interface MapError {
  type: 'token' | 'network' | 'coordinate' | 'render' | 'unknown';
  message: string;
  details?: any;
  timestamp: number;
}

export const useMapErrorHandling = () => {
  const [errors, setErrors] = useState<MapError[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  const addError = useCallback((error: Omit<MapError, 'timestamp'>) => {
    const mapError: MapError = {
      ...error,
      timestamp: Date.now()
    };
    
    setErrors(prev => [...prev.slice(-4), mapError]); // Keep last 5 errors
    console.error(`Map Error [${error.type}]:`, error.message, error.details);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleTokenError = useCallback(() => {
    addError({
      type: 'token',
      message: 'Unable to load Mapbox token. Please check your configuration.',
      details: { suggestion: 'Verify Mapbox token in Supabase Edge Functions' }
    });
  }, [addError]);

  const handleNetworkError = useCallback((error: any) => {
    addError({
      type: 'network',
      message: 'Network error while loading map data',
      details: error
    });
  }, [addError]);

  const handleCoordinateError = useCallback((coordinate: any, context: string) => {
    addError({
      type: 'coordinate',
      message: `Invalid coordinates in ${context}`,
      details: { coordinate, context }
    });
  }, [addError]);

  const handleRenderError = useCallback((error: any) => {
    addError({
      type: 'render',
      message: 'Map rendering error',
      details: error
    });
  }, [addError]);

  const retry = useCallback(async (retryFn: () => Promise<void>) => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await retryFn();
      clearErrors();
    } catch (error) {
      addError({
        type: 'unknown',
        message: 'Retry failed',
        details: error
      });
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, clearErrors, addError]);

  const getLatestError = useCallback(() => {
    return errors[errors.length - 1] || null;
  }, [errors]);

  const hasErrorType = useCallback((type: MapError['type']) => {
    return errors.some(error => error.type === type);
  }, [errors]);

  return {
    errors,
    isRetrying,
    addError,
    clearErrors,
    handleTokenError,
    handleNetworkError,
    handleCoordinateError,
    handleRenderError,
    retry,
    getLatestError,
    hasErrorType
  };
};