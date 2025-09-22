import { useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  delay?: number;
}

export const useLazyLoading = (
  options: LazyLoadingOptions = {}
) => {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    delay = 0
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  const observe = useCallback((element: HTMLElement) => {
    elementRef.current = element;
    
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsVisible(true);
      setHasLoaded(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setHasLoaded(true);
            }, delay);
          } else {
            setIsVisible(true);
            setHasLoaded(true);
          }
          
          // Stop observing once loaded
          if (observerRef.current && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
          }
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (element) {
      observerRef.current.observe(element);
    }
  }, [rootMargin, threshold, delay]);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isVisible,
    hasLoaded,
    observe,
    disconnect,
    ref: elementRef
  };
};

// Hook for preloading images
export const useImagePreloader = (sources: string[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const preloadImages = useCallback(async () => {
    if (sources.length === 0) return;
    
    setIsLoading(true);
    const promises = sources.map(src => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve(src);
        };
        img.onerror = () => reject(src);
        img.src = src;
      });
    });

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sources]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  return {
    loadedImages,
    isLoading,
    allLoaded: loadedImages.size === sources.length
  };
};

// Hook for progressive enhancement
export const useProgressiveEnhancement = () => {
  const [capabilities, setCapabilities] = useState({
    webgl: false,
    webWorker: false,
    webAssembly: false,
    intersectionObserver: false,
    requestIdleCallback: false,
    serviceWorker: false
  });

  useEffect(() => {
    const checkCapabilities = () => {
      setCapabilities({
        webgl: !!window.WebGLRenderingContext,
        webWorker: !!window.Worker,
        webAssembly: !!window.WebAssembly,
        intersectionObserver: !!window.IntersectionObserver,
        requestIdleCallback: !!window.requestIdleCallback,
        serviceWorker: !!('serviceWorker' in navigator)
      });
    };

    checkCapabilities();
  }, []);

  return capabilities;
};