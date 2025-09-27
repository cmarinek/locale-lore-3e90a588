import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MapBounds, FactMarker } from '@/types/map';

export interface MapState {
  // Map instance and status
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Map view state
  center: [number, number];
  zoom: number;
  bounds: MapBounds | null;
  style: string;
  
  // Map features
  markers: FactMarker[];
  selectedMarkerId: string | null;
  hoveredMarkerId: string | null;
  
  // Clustering
  clusters: Array<{
    id: string;
    latitude: number;
    longitude: number;
    count: number;
    bounds: MapBounds;
  }>;
  showClusters: boolean;
  
  // Performance settings
  enablePerformanceMode: boolean;
  tileCacheSize: number;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setBounds: (bounds: MapBounds | null) => void;
  setStyle: (style: string) => void;
  setMarkers: (markers: FactMarker[]) => void;
  addMarker: (marker: FactMarker) => void;
  removeMarker: (markerId: string) => void;
  setSelectedMarkerId: (markerId: string | null) => void;
  setHoveredMarkerId: (markerId: string | null) => void;
  setClusters: (clusters: MapState['clusters']) => void;
  setShowClusters: (show: boolean) => void;
  setPerformanceMode: (enabled: boolean) => void;
  setTileCacheSize: (size: number) => void;
  resetMapState: () => void;
}

const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128]; // NYC
const DEFAULT_ZOOM = 10;
const DEFAULT_STYLE = 'mapbox://styles/mapbox/light-v11';

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isLoading: false,
      error: null,
      
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      bounds: null,
      style: DEFAULT_STYLE,
      
      markers: [],
      selectedMarkerId: null,
      hoveredMarkerId: null,
      
      clusters: [],
      showClusters: true,
      
      enablePerformanceMode: false,
      tileCacheSize: 50,
      
      // Actions
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setCenter: (center) => set({ center }),
      setZoom: (zoom) => set({ zoom }),
      setBounds: (bounds) => set({ bounds }),
      setStyle: (style) => set({ style }),
      
      setMarkers: (markers) => set({ markers }),
      addMarker: (marker) => set((state) => ({ 
        markers: [...state.markers, marker] 
      })),
      removeMarker: (markerId) => set((state) => ({ 
        markers: state.markers.filter(m => m.id !== markerId) 
      })),
      
      setSelectedMarkerId: (markerId) => set({ selectedMarkerId: markerId }),
      setHoveredMarkerId: (markerId) => set({ hoveredMarkerId: markerId }),
      
      setClusters: (clusters) => set({ clusters }),
      setShowClusters: (show) => set({ showClusters: show }),
      
      setPerformanceMode: (enabled) => set({ enablePerformanceMode: enabled }),
      setTileCacheSize: (size) => set({ tileCacheSize: size }),
      
      resetMapState: () => set({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        bounds: null,
        markers: [],
        selectedMarkerId: null,
        hoveredMarkerId: null,
        clusters: [],
        error: null,
      }),
    }),
    {
      name: 'map-store',
      partialize: (state) => ({
        center: state.center,
        zoom: state.zoom,
        style: state.style,
        showClusters: state.showClusters,
        enablePerformanceMode: state.enablePerformanceMode,
        tileCacheSize: state.tileCacheSize,
      }),
    }
  )
);