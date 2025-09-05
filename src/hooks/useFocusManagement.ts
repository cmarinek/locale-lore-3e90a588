import { useEffect, useRef } from 'react';

interface FocusManagementOptions {
  autoFocus?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export const useFocusManagement = (
  isOpen: boolean = true, 
  options: FocusManagementOptions = {}
) => {
  const { autoFocus = true, trapFocus = true, restoreFocus = true } = options;
  const previouslyFocusedElementRef = useRef<Element | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the currently focused element
    if (restoreFocus) {
      previouslyFocusedElementRef.current = document.activeElement;
    }

    // Auto focus the first focusable element
    if (autoFocus && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }

    // Trap focus within the container
    const handleTabKey = (e: KeyboardEvent) => {
      if (!trapFocus || !containerRef.current || e.key !== 'Tab') return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Restore focus to the previously focused element
      if (restoreFocus && previouslyFocusedElementRef.current) {
        (previouslyFocusedElementRef.current as HTMLElement).focus?.();
      }
    };
  }, [isOpen, autoFocus, trapFocus, restoreFocus]);

  return containerRef;
};

// Hook for mobile focus management
export const useMobileFocus = () => {
  useEffect(() => {
    const handleTouchStart = () => {
      document.body.classList.add('using-touch');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('using-touch');
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};