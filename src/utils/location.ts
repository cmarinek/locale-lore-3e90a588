import { Geolocation } from '@capacitor/geolocation';

export interface LocationResult {
  coordinates: [number, number]; // [lng, lat]
  accuracy: 'precise' | 'region' | 'fallback';
  source: string;
}

// Region-based fallback coordinates
const REGION_FALLBACKS: Record<string, [number, number]> = {
  // North America
  'US': [-95.7129, 37.0902], // Geographic center of US
  'CA': [-106.3468, 56.1304], // Geographic center of Canada
  'MX': [-102.5528, 23.6345], // Geographic center of Mexico
  
  // Europe
  'GB': [-3.4360, 55.3781], // Geographic center of UK
  'DE': [10.4515, 51.1657], // Geographic center of Germany
  'FR': [2.2137, 46.2276], // Geographic center of France
  'IT': [12.5674, 41.8719], // Geographic center of Italy
  'ES': [-3.7492, 40.4637], // Geographic center of Spain
  'NL': [5.2913, 52.1326], // Geographic center of Netherlands
  'SE': [18.6435, 60.1282], // Geographic center of Sweden
  'NO': [9.5018, 60.4720], // Geographic center of Norway
  'DK': [9.5018, 56.2639], // Geographic center of Denmark
  'FI': [25.7482, 61.9241], // Geographic center of Finland
  
  // Asia Pacific
  'JP': [138.2529, 36.2048], // Geographic center of Japan
  'CN': [104.1954, 35.8617], // Geographic center of China
  'IN': [78.9629, 20.5937], // Geographic center of India
  'AU': [133.7751, -25.2744], // Geographic center of Australia
  'KR': [127.7669, 35.9078], // Geographic center of South Korea
  'TH': [100.9925, 15.8700], // Geographic center of Thailand
  'VN': [108.2772, 14.0583], // Geographic center of Vietnam
  'ID': [113.9213, -0.7893], // Geographic center of Indonesia
  'MY': [101.9758, 4.2105], // Geographic center of Malaysia
  'SG': [103.8198, 1.3521], // Singapore
  'PH': [121.7740, 12.8797], // Geographic center of Philippines
  
  // Others
  'BR': [-51.9253, -14.2350], // Geographic center of Brazil
  'AR': [-63.6167, -38.4161], // Geographic center of Argentina
  'ZA': [22.9375, -30.5595], // Geographic center of South Africa
  'EG': [30.8025, 26.8206], // Geographic center of Egypt
  'NG': [8.6753, 9.0820], // Geographic center of Nigeria
  'KE': [37.9062, -0.0236], // Geographic center of Kenya
  'RU': [105.3188, 61.5240], // Geographic center of Russia
};

// Major city fallbacks if country not found
const MAJOR_CITIES: [number, number][] = [
  [-74.0060, 40.7128], // New York
  [-0.1276, 51.5074], // London
  [2.3522, 48.8566], // Paris
  [139.6917, 35.6895], // Tokyo
  [-122.4194, 37.7749], // San Francisco
  [151.2093, -33.8688], // Sydney
];

export class LocationService {
  private static instance: LocationService;
  
  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Get the device's location using Capacitor Geolocation with fallbacks
   */
  async getDeviceLocation(): Promise<LocationResult> {
    try {
      // First, try to get precise location using Capacitor
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      return {
        coordinates: [position.coords.longitude, position.coords.latitude],
        accuracy: 'precise',
        source: 'capacitor-gps'
      };
    } catch (capacitorError) {
      console.log('Capacitor geolocation failed, trying web API:', capacitorError);
      
      // Fallback to web geolocation API
      try {
        const position = await this.getWebLocation();
        return {
          coordinates: [position.coords.longitude, position.coords.latitude],
          accuracy: 'precise',
          source: 'web-gps'
        };
      } catch (webError) {
        console.log('Web geolocation failed, using region fallback:', webError);
        
        // Final fallback to region-based location
        return await this.getRegionFallback();
      }
    }
  }

  /**
   * Web Geolocation API wrapper
   */
  private getWebLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator?.geolocation) {
        reject(new Error('Geolocation not supported in this environment'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Get region-based fallback using timezone and language
   */
  private async getRegionFallback(): Promise<LocationResult> {
    try {
      // Try to detect region from timezone and language
      const region = this.detectRegion();
      const coordinates = REGION_FALLBACKS[region];
      
      if (coordinates) {
        return {
          coordinates,
          accuracy: 'region',
          source: `region-${region}`
        };
      }
    } catch (error) {
      console.log('Region detection failed:', error);
    }

    // Ultimate fallback to a major city
    const fallbackCoords = MAJOR_CITIES[0]; // Default to New York
    return {
      coordinates: fallbackCoords,
      accuracy: 'fallback',
      source: 'major-city-fallback'
    };
  }

  /**
   * Detect region from timezone and language settings
   */
  private detectRegion(): string {
    // Try timezone first
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Map common timezones to regions
      if (timezone.includes('America/')) {
        if (timezone.includes('New_York') || timezone.includes('Chicago') || 
            timezone.includes('Denver') || timezone.includes('Los_Angeles')) {
          return 'US';
        }
        if (timezone.includes('Toronto') || timezone.includes('Vancouver')) {
          return 'CA';
        }
        if (timezone.includes('Mexico')) {
          return 'MX';
        }
        if (timezone.includes('Sao_Paulo') || timezone.includes('Brasilia')) {
          return 'BR';
        }
        if (timezone.includes('Buenos_Aires')) {
          return 'AR';
        }
      }
      
      if (timezone.includes('Europe/')) {
        if (timezone.includes('London')) return 'GB';
        if (timezone.includes('Berlin')) return 'DE';
        if (timezone.includes('Paris')) return 'FR';
        if (timezone.includes('Rome')) return 'IT';
        if (timezone.includes('Madrid')) return 'ES';
        if (timezone.includes('Amsterdam')) return 'NL';
        if (timezone.includes('Stockholm')) return 'SE';
        if (timezone.includes('Oslo')) return 'NO';
        if (timezone.includes('Copenhagen')) return 'DK';
        if (timezone.includes('Helsinki')) return 'FI';
      }
      
      if (timezone.includes('Asia/')) {
        if (timezone.includes('Tokyo')) return 'JP';
        if (timezone.includes('Shanghai') || timezone.includes('Beijing')) return 'CN';
        if (timezone.includes('Kolkata')) return 'IN';
        if (timezone.includes('Seoul')) return 'KR';
        if (timezone.includes('Bangkok')) return 'TH';
        if (timezone.includes('Ho_Chi_Minh')) return 'VN';
        if (timezone.includes('Jakarta')) return 'ID';
        if (timezone.includes('Kuala_Lumpur')) return 'MY';
        if (timezone.includes('Singapore')) return 'SG';
        if (timezone.includes('Manila')) return 'PH';
      }
      
      if (timezone.includes('Australia/')) return 'AU';
      if (timezone.includes('Africa/')) {
        if (timezone.includes('Cairo')) return 'EG';
        if (timezone.includes('Lagos')) return 'NG';
        if (timezone.includes('Nairobi')) return 'KE';
        if (timezone.includes('Johannesburg')) return 'ZA';
      }
    } catch (error) {
      console.log('Timezone detection failed:', error);
    }

    // Fallback to language detection
    const language = navigator.language || navigator.languages?.[0] || 'en-US';
    const countryCode = language.split('-')[1]?.toUpperCase();
    
    if (countryCode && REGION_FALLBACKS[countryCode]) {
      return countryCode;
    }

    // Default fallback
    return 'US';
  }

  /**
   * Check if location permissions are available
   */
  async checkPermissions() {
    try {
      return await Geolocation.checkPermissions();
    } catch (error) {
      console.log('Permission check failed:', error);
      return { location: 'prompt' };
    }
  }

  /**
   * Request location permissions
   */
  async requestPermissions() {
    try {
      return await Geolocation.requestPermissions();
    } catch (error) {
      console.log('Permission request failed:', error);
      return { location: 'denied' };
    }
  }
}

export const locationService = LocationService.getInstance();
