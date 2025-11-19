// High-performance Web Worker for map data processing
const self = globalThis as any;

interface FactMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
  verified: boolean;
  voteScore: number;
  authorName: string;
  createdAt: string;
}

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  facts: FactMarker[];
}

// Ultra-fast clustering algorithm
function clusterFacts(facts: FactMarker[], zoom: number, bounds: ViewportBounds): ClusterPoint[] {
  if (zoom > 14) return []; // No clustering at high zoom
  
  const gridSize = getGridSize(zoom);
  const clusters = new Map<string, ClusterPoint>();
  
  for (const fact of facts) {
    if (!isInBounds(fact, bounds)) continue;
    
    const gridX = Math.floor(fact.longitude / gridSize);
    const gridY = Math.floor(fact.latitude / gridSize);
    const key = `${gridX}_${gridY}`;
    
    if (clusters.has(key)) {
      const cluster = clusters.get(key)!;
      cluster.count++;
      cluster.facts.push(fact);
      // Update cluster center (weighted average)
      cluster.latitude = (cluster.latitude * (cluster.count - 1) + fact.latitude) / cluster.count;
      cluster.longitude = (cluster.longitude * (cluster.count - 1) + fact.longitude) / cluster.longitude;
    } else {
      clusters.set(key, {
        id: key,
        latitude: fact.latitude,
        longitude: fact.longitude,
        count: 1,
        facts: [fact]
      });
    }
  }
  
  return Array.from(clusters.values()).filter(cluster => cluster.count >= getMinClusterSize(zoom));
}

function getGridSize(zoom: number): number {
  if (zoom <= 2) return 10.0;
  if (zoom <= 4) return 5.0;
  if (zoom <= 6) return 2.0;
  if (zoom <= 8) return 1.0;
  if (zoom <= 10) return 0.5;
  if (zoom <= 12) return 0.25;
  return 0.1;
}

function getMinClusterSize(zoom: number): number {
  if (zoom <= 6) return 5;
  if (zoom <= 10) return 3;
  return 2;
}

function isInBounds(fact: FactMarker, bounds: ViewportBounds): boolean {
  return fact.latitude >= bounds.south &&
         fact.latitude <= bounds.north &&
         fact.longitude >= bounds.west &&
         fact.longitude <= bounds.east;
}

// Advanced spatial indexing for ultra-fast lookups
class SpatialIndex {
  private gridSize: number;
  private grid: Map<string, FactMarker[]>;
  
  constructor(gridSize: number = 0.1) {
    this.gridSize = gridSize;
    this.grid = new Map();
  }
  
  addFact(fact: FactMarker): void {
    const key = this.getGridKey(fact.latitude, fact.longitude);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(fact);
  }
  
  getFactsInBounds(bounds: ViewportBounds): FactMarker[] {
    const results: FactMarker[] = [];
    const startX = Math.floor(bounds.west / this.gridSize);
    const endX = Math.ceil(bounds.east / this.gridSize);
    const startY = Math.floor(bounds.south / this.gridSize);
    const endY = Math.ceil(bounds.north / this.gridSize);
    
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x}_${y}`;
        const cellFacts = this.grid.get(key) || [];
        results.push(...cellFacts.filter(fact => isInBounds(fact, bounds)));
      }
    }
    
    return results;
  }
  
  private getGridKey(lat: number, lng: number): string {
    const x = Math.floor(lng / this.gridSize);
    const y = Math.floor(lat / this.gridSize);
    return `${x}_${y}`;
  }
}

// Performance-optimized GeoJSON processing
function processGeoJSONData(facts: FactMarker[]): any {
  const features = facts.map(fact => ({
    type: 'Feature',
    properties: {
      id: fact.id,
      title: fact.title,
      category: fact.category,
      verified: fact.verified,
      voteScore: fact.voteScore
    },
    geometry: {
      type: 'Point',
      coordinates: [fact.longitude, fact.latitude]
    }
  }));
  
  return {
    type: 'FeatureCollection',
    features
  };
}

// Main worker message handler
self.onmessage = function(e) {
  const { type, data, id } = e.data;
  
  try {
    let result;
    const startTime = performance.now();
    
    switch (type) {
      case 'clusterFacts':
        result = clusterFacts(data.facts, data.zoom, data.bounds);
        break;
        
      case 'processGeoJSON':
        result = processGeoJSONData(data.facts);
        break;
        
      case 'filterByBounds':
        result = data.facts.filter((fact: FactMarker) => isInBounds(fact, data.bounds));
        break;
        
      case 'buildSpatialIndex': {
        const index = new SpatialIndex(data.gridSize);
        data.facts.forEach((fact: FactMarker) => index.addFact(fact));
        result = { success: true, factsIndexed: data.facts.length };
        break;
      }
        
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    const processingTime = performance.now() - startTime;
    
    self.postMessage({
      id,
      type: 'success',
      result,
      processingTime
    });
    
  } catch (error) {
    self.postMessage({
      id,
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Initialize worker
self.postMessage({ type: 'ready' });