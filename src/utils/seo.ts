
import { useEffect } from 'react';

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  structuredData?: any;
}

export class SEOManager {
  private defaultMeta: SEOData = {
    title: 'LocaleLore - Discover Hidden Stories Around the World',
    description: 'Explore fascinating facts and hidden stories about locations worldwide. Discover, learn, and share geographical knowledge with our community.',
    keywords: ['geography', 'facts', 'travel', 'discovery', 'stories', 'locations'],
    siteName: 'LocaleLore',
    type: 'website',
  };

  // Preload critical resources
  preloadCriticalResources(): void {
    const criticalResources = [
      { href: '/icon-192.png', as: 'image', type: 'image/png' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', as: 'style' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      document.head.appendChild(link);
    });
  }

  // Update page meta tags
  public updateMeta(seoData: Partial<SEOData>) {
    const meta = { ...this.defaultMeta, ...seoData };

    // Update title
    document.title = meta.title;

    // Update meta tags
    this.setMetaTag('description', meta.description);
    this.setMetaTag('keywords', meta.keywords?.join(', ') || '');

    // Open Graph tags
    this.setMetaTag('og:title', meta.title, 'property');
    this.setMetaTag('og:description', meta.description, 'property');
    this.setMetaTag('og:type', meta.type || 'website', 'property');
    this.setMetaTag('og:site_name', meta.siteName || '', 'property');
    
    if (meta.image) {
      this.setMetaTag('og:image', meta.image, 'property');
    }
    
    if (meta.url) {
      this.setMetaTag('og:url', meta.url, 'property');
      this.setMetaTag('canonical', meta.url, 'link');
    }

    // Twitter Card tags
    this.setMetaTag('twitter:card', 'summary_large_image', 'name');
    this.setMetaTag('twitter:title', meta.title, 'name');
    this.setMetaTag('twitter:description', meta.description, 'name');
    
    if (meta.image) {
      this.setMetaTag('twitter:image', meta.image, 'name');
    }

    // Add structured data
    if (meta.structuredData) {
      this.addStructuredData(meta.structuredData);
    }
  }

  // Set individual meta tag
  private setMetaTag(name: string, content: string, type: 'name' | 'property' | 'link' = 'name') {
    if (!content) return;

    if (type === 'link') {
      let link = document.querySelector(`link[rel="${name}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = name;
        document.head.appendChild(link);
      }
      link.href = content;
      return;
    }

    const attribute = type === 'property' ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  }

  // Add structured data (JSON-LD)
  private addStructuredData(data: any) {
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Generate structured data for local business
  public generateLocalBusinessData(business: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: business.name,
      description: business.description,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address?.street,
        addressLocality: business.address?.city,
        addressRegion: business.address?.region,
        postalCode: business.address?.postalCode,
        addressCountry: business.address?.country,
      },
      geo: business.coordinates ? {
        '@type': 'GeoCoordinates',
        latitude: business.coordinates.lat,
        longitude: business.coordinates.lng,
      } : undefined,
      telephone: business.phone,
      url: business.website,
      image: business.image,
    };
  }

  // Generate structured data for articles/facts
  public generateArticleData(fact: any) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: fact.title,
      description: fact.description,
      author: {
        '@type': 'Person',
        name: fact.author?.name || 'Anonymous',
      },
      datePublished: fact.created_at,
      dateModified: fact.updated_at,
      image: fact.image_url,
      publisher: {
        '@type': 'Organization',
        name: 'LocaleLore',
        logo: {
          '@type': 'ImageObject',
          url: '/icon-192.png',
        },
      },
    };
  }
}

// React hook for SEO management
export const useSEO = (config: Partial<SEOData>) => {
  useEffect(() => {
    seoManager.updateMeta(config);
  }, [config.title, config.description, config.image, config.url]);
  
  return {
    updateMeta: (newConfig: Partial<SEOData>) => seoManager.updateMeta(newConfig),
    generateArticleData: seoManager.generateArticleData.bind(seoManager),
    generateLocalBusinessData: seoManager.generateLocalBusinessData.bind(seoManager)
  };
};

export const seoManager = new SEOManager();
