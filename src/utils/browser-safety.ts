/**
 * Browser API safety utilities to prevent TDZ and undefined errors
 */

export const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

export const isNavigatorAvailable = (): boolean => {
  return isBrowserEnvironment() && typeof navigator !== 'undefined';
};

export const isGeolocationAvailable = (): boolean => {
  return (
    isNavigatorAvailable() && 
    'geolocation' in navigator && 
    navigator.geolocation &&
    typeof navigator.geolocation.getCurrentPosition === 'function'
  );
};

export const isIntlAvailable = (): boolean => {
  return (
    typeof Intl !== 'undefined' && 
    typeof Intl.DateTimeFormat === 'function'
  );
};

export const safeNavigatorAccess = <T>(
  accessor: (nav: Navigator) => T,
  fallback: T
): T => {
  try {
    if (!isNavigatorAvailable()) return fallback;
    return accessor(navigator);
  } catch (error) {
    console.warn('Navigator access failed:', error);
    return fallback;
  }
};

export const safeIntlAccess = <T>(
  accessor: () => T,
  fallback: T
): T => {
  try {
    if (!isIntlAvailable()) return fallback;
    return accessor();
  } catch (error) {
    console.warn('Intl access failed:', error);
    return fallback;
  }
};

/**
 * Safe wrapper for browser APIs that might not be available
 */
export class BrowserSafetyWrapper {
  static getLanguage(): string {
    return safeNavigatorAccess(
      (nav) => nav.language || (nav.languages && nav.languages[0]) || 'en-US',
      'en-US'
    );
  }

  static getTimezone(): string {
    return safeIntlAccess(
      () => Intl.DateTimeFormat().resolvedOptions().timeZone,
      'UTC'
    );
  }

  static getUserAgent(): string {
    return safeNavigatorAccess(
      (nav) => nav.userAgent,
      'Unknown'
    );
  }

  static isOnline(): boolean {
    return safeNavigatorAccess(
      (nav) => nav.onLine,
      true
    );
  }

  static isGeolocationAvailable(): boolean {
    return isGeolocationAvailable();
  }
}