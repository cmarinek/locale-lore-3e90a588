import { FactMarker } from '@/types/map';

export interface MarkerCluster {
  id: string;
  center: [number, number]; // [lng, lat]
  markers: FactMarker[];
  count: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom: number;
}

export interface ClusteringOptions {
  maxZoom: number;
  radius: number;
  minPoints: number;
  extent: number;
}

export class MapMarkerClustering {
  private options: ClusteringOptions;
  private clusters: Map<number, MarkerCluster[]> = new Map();

  constructor(options: Partial<ClusteringOptions> = {}) {
    this.options = {
      maxZoom: 16,
      radius: 60,
      minPoints: 2,
      extent: 512,
      ...options
    };
  }

  // Main clustering method
  public clusterMarkers(markers: FactMarker[], zoom: number): MarkerCluster[] {
    if (zoom > this.options.maxZoom) {
      // Return individual markers as single-item clusters at high zoom
      return markers.map(marker => this.createSingleMarkerCluster(marker, zoom));
    }

    // Check if we have cached clusters for this zoom level
    const cached = this.clusters.get(zoom);
    if (cached) {
      return cached;
    }

    // Create new clusters
    const clusters = this.performClustering(markers, zoom);
    this.clusters.set(zoom, clusters);
    
    return clusters;
  }

  private performClustering(markers: FactMarker[], zoom: number): MarkerCluster[] {
    const clustered: Set<FactMarker> = new Set();
    const clusters: MarkerCluster[] = [];

    for (const marker of markers) {
      if (clustered.has(marker)) continue;

      const nearby = this.findNearbyMarkers(marker, markers, zoom, clustered);
      
      if (nearby.length >= this.options.minPoints) {
        // Create cluster
        const cluster = this.createCluster(nearby, zoom);
        clusters.push(cluster);
        nearby.forEach(m => clustered.add(m));
      } else {
        // Create single marker cluster
        const singleCluster = this.createSingleMarkerCluster(marker, zoom);
        clusters.push(singleCluster);
        clustered.add(marker);
      }
    }

    return clusters;
  }

  private findNearbyMarkers(
    centerMarker: FactMarker, 
    allMarkers: FactMarker[], 
    zoom: number,
    excludeSet: Set<FactMarker>
  ): FactMarker[] {
    const nearby: FactMarker[] = [centerMarker];
    const centerPixel = this.lngLatToPixel(centerMarker.longitude, centerMarker.latitude, zoom);

    for (const marker of allMarkers) {
      if (marker === centerMarker || excludeSet.has(marker)) continue;

      const markerPixel = this.lngLatToPixel(marker.longitude, marker.latitude, zoom);
      const distance = this.getPixelDistance(centerPixel, markerPixel);

      if (distance <= this.options.radius) {
        nearby.push(marker);
      }
    }

    return nearby;
  }

  private createCluster(markers: FactMarker[], zoom: number): MarkerCluster {
    const bounds = this.calculateBounds(markers);
    const center = this.calculateCenter(markers);

    return {
      id: this.generateClusterId(markers),
      center,
      markers,
      count: markers.length,
      bounds,
      zoom
    };
  }

  private createSingleMarkerCluster(marker: FactMarker, zoom: number): MarkerCluster {
    return {
      id: `single-${marker.id}`,
      center: [marker.longitude, marker.latitude],
      markers: [marker],
      count: 1,
      bounds: {
        north: marker.latitude,
        south: marker.latitude,
        east: marker.longitude,
        west: marker.longitude
      },
      zoom
    };
  }

  private calculateCenter(markers: FactMarker[]): [number, number] {
    const totalLng = markers.reduce((sum, m) => sum + m.longitude, 0);
    const totalLat = markers.reduce((sum, m) => sum + m.latitude, 0);
    
    return [totalLng / markers.length, totalLat / markers.length];
  }

  private calculateBounds(markers: FactMarker[]) {
    let north = -90, south = 90, east = -180, west = 180;

    for (const marker of markers) {
      north = Math.max(north, marker.latitude);
      south = Math.min(south, marker.latitude);
      east = Math.max(east, marker.longitude);
      west = Math.min(west, marker.longitude);
    }

    return { north, south, east, west };
  }

  private lngLatToPixel(lng: number, lat: number, zoom: number): [number, number] {
    const scale = Math.pow(2, zoom);
    const worldSize = this.options.extent * scale;
    
    const x = worldSize * (lng / 360 + 0.5);
    const y = worldSize * (0.5 - Math.log(Math.tan((lat * Math.PI / 180 + Math.PI / 2) / 2)) / (2 * Math.PI));
    
    return [x, y];
  }

  private getPixelDistance([x1, y1]: [number, number], [x2, y2]: [number, number]): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private generateClusterId(markers: FactMarker[]): string {
    const sortedIds = markers.map(m => m.id).sort().join('-');
    return `cluster-${this.hashString(sortedIds)}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Clear cached clusters
  public clearCache(): void {
    this.clusters.clear();
  }

  // Update clustering options
  public updateOptions(newOptions: Partial<ClusteringOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.clearCache();
  }

  // Get cluster statistics
  public getClusterStats(zoom: number): {
    totalClusters: number;
    singleMarkerClusters: number;
    multiMarkerClusters: number;
    largestClusterSize: number;
    averageClusterSize: number;
  } {
    const clusters = this.clusters.get(zoom) || [];
    const singleMarkerClusters = clusters.filter(c => c.count === 1).length;
    const multiMarkerClusters = clusters.filter(c => c.count > 1).length;
    const largestClusterSize = Math.max(...clusters.map(c => c.count), 0);
    const averageClusterSize = clusters.length > 0 
      ? clusters.reduce((sum, c) => sum + c.count, 0) / clusters.length 
      : 0;

    return {
      totalClusters: clusters.length,
      singleMarkerClusters,
      multiMarkerClusters,
      largestClusterSize,
      averageClusterSize
    };
  }
}

// Utility function to create optimized clustering instance
export const createOptimizedClustering = (options?: Partial<ClusteringOptions>) => {
  return new MapMarkerClustering({
    maxZoom: 16,
    radius: 60,
    minPoints: 2,
    extent: 512,
    ...options
  });
};