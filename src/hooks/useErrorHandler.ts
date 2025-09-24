import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  retryable?: boolean;
  onRetry?: () => void;
  context?: string;
}

interface ErrorInfo {
  code?: string;
  status?: number;
  context?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const { t } = useTranslation('common');

  const logErrorToService = useCallback((error: Error, info: ErrorInfo) => {
    // In production, this would send to an error tracking service
    console.error('Error logged:', {
      message: error.message,
      stack: error.stack,
      ...info,
    });

    // Could send to Sentry, LogRocket, etc.
    // Sentry.captureException(error, { extra: info });
  }, []);

  const getErrorMessage = useCallback((error: Error | string): string => {
    if (typeof error === 'string') {
      return error;
    }

    // Map common error codes to user-friendly messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return t('errors.network');
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
      return t('errors.unauthorized');
    }
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return t('errors.notFound');
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    return error.message || t('errors.general');
  }, [t]);

  const handleError = useCallback((
    error: Error | string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage,
      retryable = false,
      onRetry,
    } = options;

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorMessage = fallbackMessage || getErrorMessage(errorObj);

    // Log error if requested
    if (logError) {
      const errorInfo: ErrorInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        context: options.fallbackMessage,
      };
      
      logErrorToService(errorObj, errorInfo);
    }

    // Show toast notification if requested
    if (showToast) {
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: 'destructive',
        // action: retryable && onRetry ? (
        //   <Button variant="outline" onClick={onRetry}>Retry</Button>
        // ) : undefined,
      });
    }

    return {
      error: errorObj,
      message: errorMessage,
      handled: true,
    };
  }, [toast, t, getErrorMessage, logErrorToService]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  const createErrorHandler = useCallback((
    options: ErrorHandlerOptions = {}
  ) => {
    return (error: Error | string) => handleError(error, options);
  }, [handleError]);

  // Specific error handlers for common scenarios
  const handleAuthError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'authentication',
      fallbackMessage: 'Authentication failed. Please try logging in again.',
    });
  }, [handleError]);

  const handleApiError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'api',
      fallbackMessage: 'Server error. Please try again later.',
      retryable: true,
    });
  }, [handleError]);

  const handleValidationError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'validation',
      fallbackMessage: 'Please check your input and try again.',
      logError: false, // Don't log validation errors
    });
  }, [handleError]);

  const handleNetworkError = useCallback((error: Error | string) => {
    return handleError(error, {
      context: 'network',
      fallbackMessage: t('errors.network'),
      retryable: true,
    });
  }, [handleError, t]);

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
    handleAuthError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    getErrorMessage,
  };
};