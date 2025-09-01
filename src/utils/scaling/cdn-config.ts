
// CDN configuration for global performance
export interface CDNConfig {
  primaryDomain: string;
  regions: string[];
  cacheTTL: number;
  imageFormats: string[];
  compressionLevel: number;
}

export class CDNManager {
  private config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
  }

  // Get optimized URL for different regions
  getRegionalURL(path: string, userRegion?: string): string {
    const region = userRegion || this.detectUserRegion();
    const regionalDomain = this.getRegionalDomain(region);
    
    return `https://${regionalDomain}${path}`;
  }

  // Get optimized image URL with format conversion
  getOptimizedImageURL(
    url: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpeg' | 'png';
      fit?: 'cover' | 'contain' | 'fill';
    } = {}
  ): string {
    if (!url) return '';

    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;

    // Build transformation parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);
    params.set('fit', fit);

    // Add cache control
    params.set('cache', '31536000'); // 1 year

    return `${url}?${params.toString()}`;
  }

  // Preload critical resources
  preloadResources(resources: Array<{ url: string; type: 'image' | 'script' | 'style' | 'font' }>) {
    resources.forEach(({ url, type }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      switch (type) {
        case 'image':
          link.as = 'image';
          break;
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'font':
          link.as = 'font';
          link.crossOrigin = 'anonymous';
          break;
      }
      
      document.head.appendChild(link);
    });
  }

  // Prefetch resources for next navigation
  prefetchResources(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  private detectUserRegion(): string {
    // Detect user region based on various factors
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Simple region mapping
    if (timezone.includes('America')) return 'us-east';
    if (timezone.includes('Europe')) return 'eu-west';
    if (timezone.includes('Asia')) return 'ap-southeast';
    
    return 'us-east'; // Default
  }

  private getRegionalDomain(region: string): string {
    const domainMap: Record<string, string> = {
      'us-east': 'cdn-us-east.localelore.com',
      'us-west': 'cdn-us-west.localelore.com',
      'eu-west': 'cdn-eu-west.localelore.com',
      'ap-southeast': 'cdn-ap-southeast.localelore.com',
    };

    return domainMap[region] || this.config.primaryDomain;
  }
}

export const cdnManager = new CDNManager({
  primaryDomain: 'cdn.localelore.com',
  regions: ['us-east', 'us-west', 'eu-west', 'ap-southeast'],
  cacheTTL: 31536000, // 1 year
  imageFormats: ['webp', 'avif', 'jpeg', 'png'],
  compressionLevel: 85
});
