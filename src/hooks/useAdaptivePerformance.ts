import { useState, useEffect, useCallback, useRef } from 'react';
import { useOffline } from '@/hooks/useOffline';

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface PerformanceSettings {
  clusterDistance: number;
  maxMarkers: number;
  tileQuality: 'low' | 'medium' | 'high';
  animationsEnabled: boolean;
  preloadRadius: number;
  cacheStrategy: 'aggressive' | 'moderate' | 'minimal';
}

interface DeviceCapabilities {
  cores: number;
  memory: number;
  pixelRatio: number;
  isHighEnd: boolean;
  isMobile: boolean;
}

export const useAdaptivePerformance = () => {
  const { isOnline } = useOffline();
  const isOffline = !isOnline;
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities | null>(null);
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    clusterDistance: 40,
    maxMarkers: 100,
    tileQuality: 'high',
    animationsEnabled: true,
    preloadRadius: 2,
    cacheStrategy: 'moderate'
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTime = useRef(performance.now());

  // Detect device capabilities
  const detectDeviceCapabilities = useCallback((): DeviceCapabilities => {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4; // GB
    const pixelRatio = window.devicePixelRatio || 1;
    
    // Simple heuristic for device classification
    const isHighEnd = cores >= 4 && memory >= 4 && pixelRatio >= 2;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return {
      cores,
      memory,
      pixelRatio,
      isHighEnd,
      isMobile
    };
  }, []);

  // Detect network conditions
  const detectNetworkInfo = useCallback((): NetworkInfo | null => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false
    };
  }, []);

  // Monitor frame rate
  const monitorFrameRate = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTime.current;
    lastFrameTime.current = now;

    frameTimeRef.current.push(frameTime);
    
    // Keep only last 30 frames
    if (frameTimeRef.current.length > 30) {
      frameTimeRef.current.shift();
    }

    // Calculate average FPS
    const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
    const fps = 1000 / avgFrameTime;

    // Adjust settings based on performance
    if (fps < 30 && frameTimeRef.current.length >= 10) {
      adjustPerformanceSettings('down');
    } else if (fps > 55 && frameTimeRef.current.length >= 10) {
      adjustPerformanceSettings('up');
    }

    requestAnimationFrame(monitorFrameRate);
  }, []);

  // Adjust performance settings
  const adjustPerformanceSettings = useCallback((direction: 'up' | 'down') => {
    setPerformanceSettings(prev => {
      if (direction === 'down') {
        // Reduce quality for better performance
        return {
          ...prev,
          clusterDistance: Math.min(prev.clusterDistance + 10, 80),
          maxMarkers: Math.max(prev.maxMarkers - 25, 25),
          tileQuality: prev.tileQuality === 'high' ? 'medium' : 'low',
          animationsEnabled: false,
          preloadRadius: Math.max(prev.preloadRadius - 1, 0),
          cacheStrategy: 'minimal'
        };
      } else {
        // Increase quality when performance allows
        return {
          ...prev,
          clusterDistance: Math.max(prev.clusterDistance - 5, 20),
          maxMarkers: Math.min(prev.maxMarkers + 15, 200),
          tileQuality: prev.tileQuality === 'low' ? 'medium' : 'high',
          animationsEnabled: true,
          preloadRadius: Math.min(prev.preloadRadius + 1, 3),
          cacheStrategy: 'moderate'
        };
      }
    });
  }, []);

  // Calculate optimal settings based on conditions
  const calculateOptimalSettings = useCallback((): PerformanceSettings => {
    const device = deviceCapabilities;
    const network = networkInfo;

    if (!device) {
      return performanceSettings;
    }

    let settings: PerformanceSettings = {
      clusterDistance: 40,
      maxMarkers: 100,
      tileQuality: 'medium',
      animationsEnabled: true,
      preloadRadius: 2,
      cacheStrategy: 'moderate'
    };

    // Adjust for device capabilities
    if (device.isHighEnd) {
      settings.maxMarkers = 200;
      settings.tileQuality = 'high';
      settings.clusterDistance = 30;
      settings.preloadRadius = 3;
      settings.cacheStrategy = 'aggressive';
    } else if (device.memory < 2 || device.cores < 2) {
      settings.maxMarkers = 50;
      settings.tileQuality = 'low';
      settings.clusterDistance = 60;
      settings.animationsEnabled = false;
      settings.preloadRadius = 1;
      settings.cacheStrategy = 'minimal';
    }

    // Adjust for network conditions
    if (network) {
      if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
        settings.tileQuality = 'low';
        settings.preloadRadius = 0;
        settings.cacheStrategy = 'minimal';
      } else if (network.saveData) {
        settings.preloadRadius = Math.max(settings.preloadRadius - 1, 0);
        settings.cacheStrategy = 'minimal';
      }

      if (network.downlink < 1) {
        settings.tileQuality = 'low';
        settings.maxMarkers = Math.min(settings.maxMarkers, 50);
      }
    }

    // Adjust for offline mode
    if (isOffline) {
      settings.preloadRadius = 0;
      settings.maxMarkers = Math.min(settings.maxMarkers, 30);
      settings.animationsEnabled = false;
    }

    return settings;
  }, [deviceCapabilities, networkInfo, isOffline, performanceSettings]);

  // Get current performance score (0-100)
  const getPerformanceScore = useCallback((): number => {
    if (frameTimeRef.current.length === 0) return 100;

    const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
    const fps = 1000 / avgFrameTime;
    
    // Score based on FPS (60 FPS = 100 score)
    return Math.min(Math.max((fps / 60) * 100, 0), 100);
  }, []);

  // Initialize
  useEffect(() => {
    setDeviceCapabilities(detectDeviceCapabilities());
    setNetworkInfo(detectNetworkInfo());
    
    // Listen for network changes
    const connection = (navigator as any).connection;
    if (connection) {
      const handleNetworkChange = () => {
        setNetworkInfo(detectNetworkInfo());
      };
      
      connection.addEventListener('change', handleNetworkChange);
      
      return () => {
        connection.removeEventListener('change', handleNetworkChange);
      };
    }
  }, [detectDeviceCapabilities, detectNetworkInfo]);

  // Start frame monitoring
  useEffect(() => {
    const animationId = requestAnimationFrame(monitorFrameRate);
    return () => cancelAnimationFrame(animationId);
  }, [monitorFrameRate]);

  // Recalculate settings when conditions change
  useEffect(() => {
    const optimalSettings = calculateOptimalSettings();
    setPerformanceSettings(optimalSettings);
  }, [calculateOptimalSettings]);

  return {
    networkInfo,
    deviceCapabilities,
    performanceSettings,
    performanceScore: getPerformanceScore(),
    adjustPerformanceSettings,
    isAdaptiveMode: true
  };
};
