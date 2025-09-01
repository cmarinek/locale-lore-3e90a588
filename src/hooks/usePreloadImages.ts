
import { useEffect } from 'react';
import { preloadImage } from '@/utils/performance';

export const usePreloadImages = (imageUrls: string[]) => {
  useEffect(() => {
    if (!imageUrls.length) return;

    // Preload images in idle time
    const preloadInIdle = () => {
      imageUrls.forEach(url => {
        if (url) {
          preloadImage(url).catch(() => {
            console.warn(`Failed to preload image: ${url}`);
          });
        }
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preloadInIdle);
    } else {
      setTimeout(preloadInIdle, 100);
    }
  }, [imageUrls]);
};
