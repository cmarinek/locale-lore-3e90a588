import { useRef, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useToast } from '@/hooks/use-toast';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: string) => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
}

/**
 * HCaptcha component for form verification
 * Requires VITE_HCAPTCHA_SITE_KEY in environment variables
 */
export const HCaptchaComponent = ({
  onVerify,
  onExpire,
  onError,
  size = 'normal',
  theme = 'light',
}: HCaptchaComponentProps) => {
  const captchaRef = useRef<HCaptcha>(null);
  const { toast } = useToast();

  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  // Skip in development if not configured
  const isDevelopment = import.meta.env.DEV;
  const skipCaptcha = import.meta.env.VITE_SKIP_CAPTCHA === 'true';

  const handleVerify = useCallback(
    (token: string) => {
      onVerify(token);
    },
    [onVerify]
  );

  const handleExpire = useCallback(() => {
    onExpire?.();
    toast({
      title: 'CAPTCHA Expired',
      description: 'Please verify again',
      variant: 'destructive',
    });
  }, [onExpire, toast]);

  const handleError = useCallback(
    (error: string) => {
      onError?.(error);
      console.error('HCaptcha error:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to verify CAPTCHA. Please try again.',
        variant: 'destructive',
      });
    },
    [onError, toast]
  );

  // Skip rendering in development if configured
  if (isDevelopment && (skipCaptcha || !siteKey)) {
    console.warn(
      'HCaptcha: Skipping in development. Set VITE_HCAPTCHA_SITE_KEY to test CAPTCHA.'
    );
    return null;
  }

  if (!siteKey) {
    console.error('HCaptcha: VITE_HCAPTCHA_SITE_KEY is not configured');
    return (
      <div className="text-sm text-destructive">
        CAPTCHA is not configured. Please contact support.
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        size={size}
        theme={theme}
      />
    </div>
  );
};

/**
 * Hook for managing CAPTCHA state
 */
export const useHCaptcha = () => {
  const captchaRef = useRef<HCaptcha>(null);

  const resetCaptcha = useCallback(() => {
    captchaRef.current?.resetCaptcha();
  }, []);

  const executeCaptcha = useCallback(async () => {
    return captchaRef.current?.execute();
  }, []);

  return {
    captchaRef,
    resetCaptcha,
    executeCaptcha,
  };
};
