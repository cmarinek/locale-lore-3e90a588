
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  blur?: boolean;
  formats?: ('avif' | 'webp' | 'jpg' | 'png')[];
  sizes?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

// Enhanced image optimization with modern formats and lazy loading
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  fallbackSrc = '/placeholder.svg',
  blur = true,
  formats = ['avif', 'webp', 'jpg'],
  sizes,
  onLoadComplete,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Format detection and progressive enhancement
  const generateSources = () => {
    if (!isInView) return [];
    
    const baseUrl = src.split('.').slice(0, -1).join('.');
    const extension = src.split('.').pop();
    
    return formats.map(format => {
      let formatSrc = src;
      
      // Convert to modern formats if supported
      if (format === 'avif' && extension !== 'avif') {
        formatSrc = `${baseUrl}.avif`;
      } else if (format === 'webp' && extension !== 'webp') {
        formatSrc = `${baseUrl}.webp`;
      }
      
      return { format, src: formatSrc };
    });
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Preload critical images
  useEffect(() => {
    if (priority && isInView) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, isInView, src]);

  const sources = generateSources();

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isInView ? (
        <>
          {sources.length > 1 ? (
            <picture>
              {sources.slice(0, -1).map(({ format, src: formatSrc }) => (
                <source
                  key={format}
                  srcSet={formatSrc}
                  type={`image/${format}`}
                  sizes={sizes}
                />
              ))}
              <img
                ref={imgRef}
                src={currentSrc}
                alt={alt}
                className={cn(
                  'w-full h-full object-cover transition-all duration-300',
                  blur && !isLoaded && 'blur-sm scale-105',
                  isLoaded && 'blur-0 scale-100',
                  hasError && 'opacity-75'
                )}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
                {...props}
              />
            </picture>
          ) : (
            <img
              ref={imgRef}
              src={currentSrc}
              alt={alt}
              className={cn(
                'w-full h-full object-cover transition-all duration-300',
                blur && !isLoaded && 'blur-sm scale-105',
                isLoaded && 'blur-0 scale-100',
                hasError && 'opacity-75'
              )}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              sizes={sizes}
              onLoad={handleLoad}
              onError={handleError}
              {...props}
            />
          )}
          
          {/* Loading placeholder */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {/* Error state */}
          {hasError && currentSrc === fallbackSrc && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-muted-foreground text-sm">
                Failed to load image
              </div>
            </div>
          )}
        </>
      ) : (
        <div 
          ref={imgRef}
          className={cn('bg-muted animate-pulse', className)}
          style={{ aspectRatio: '16/9' }}
        />
      )}
    </div>
  );
};

// Image preloader utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch image preloader
export const preloadImages = async (sources: string[]): Promise<void> => {
  try {
    await Promise.all(sources.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};
