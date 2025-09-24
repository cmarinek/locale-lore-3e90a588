import { useCallback } from 'react';
import { Coordinate, isValidCoordinate, sanitizeCoordinate, toStandardCoordinate } from '@/utils/coordinates';

export interface CoordinateValidationResult {
  isValid: boolean;
  sanitized: Coordinate;
  errors: string[];
}

export const useMapCoordinateValidation = () => {
  const validateCoordinates = useCallback((
    longitude: number | string, 
    latitude: number | string
  ): CoordinateValidationResult => {
    const errors: string[] = [];
    
    // Convert to numbers
    const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    
    // Check for valid numbers and ranges
    if (!isValidCoordinate(lng, lat)) {
      if (isNaN(lng)) errors.push('Invalid longitude: not a number');
      if (isNaN(lat)) errors.push('Invalid latitude: not a number');
      if (!isNaN(lng) && (lng < -180 || lng > 180)) {
        errors.push(`Longitude ${lng} out of bounds (-180 to 180)`);
      }
      if (!isNaN(lat) && (lat < -90 || lat > 90)) {
        errors.push(`Latitude ${lat} out of bounds (-90 to 90)`);
      }
    }
    
    // Sanitize coordinates
    const sanitized = sanitizeCoordinate(lng, lat);
    
    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }, []);

  const validateCoordinateInput = useCallback((input: any): CoordinateValidationResult => {
    const errors: string[] = [];
    
    const coordinate = toStandardCoordinate(input);
    if (!coordinate) {
      errors.push('Invalid coordinate format');
      return {
        isValid: false,
        sanitized: [0, 0],
        errors
      };
    }
    
    const [lng, lat] = coordinate;
    return validateCoordinates(lng, lat);
  }, [validateCoordinates]);
  
  const validateBounds = useCallback((
    north: number,
    south: number, 
    east: number,
    west: number
  ): CoordinateValidationResult => {
    const errors: string[] = [];
    
    // Validate individual coordinates
    const northResult = validateCoordinates(north, 0);
    const southResult = validateCoordinates(south, 0);
    const eastResult = validateCoordinates(0, east);
    const westResult = validateCoordinates(0, west);
    
    errors.push(...northResult.errors, ...southResult.errors, ...eastResult.errors, ...westResult.errors);
    
    // Check logical bounds
    if (north <= south) {
      errors.push('North bound must be greater than south bound');
    }
    
    if (east <= west) {
      errors.push('East bound must be greater than west bound');
    }
    
    // Sanitize bounds
    const sanitizedNorth = Math.max(-90, Math.min(90, north));
    const sanitizedSouth = Math.max(-90, Math.min(90, south));
    const sanitizedEast = Math.max(-180, Math.min(180, east));
    const sanitizedWest = Math.max(-180, Math.min(180, west));
    
    return {
      isValid: errors.length === 0,
      sanitized: [sanitizedWest, sanitizedSouth], // Return as [lng, lat] for consistency
      errors
    };
  }, [validateCoordinates]);
  
  const formatCoordinates = useCallback((
    latitude: number,
    longitude: number,
    precision: number = 6
  ): string => {
    const lat = parseFloat(latitude.toFixed(precision));
    const lng = parseFloat(longitude.toFixed(precision));
    
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat)}°${latDir}, ${Math.abs(lng)}°${lngDir}`;
  }, []);
  
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }, []);
  
  return {
    validateCoordinates,
    validateCoordinateInput,
    validateBounds,
    formatCoordinates,
    calculateDistance
  };
};