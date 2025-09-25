// 2025 Web Worker Performance Optimizations
export class PerformanceWebWorker {
  private worker: Worker | null = null;
  private taskQueue: Array<{ task: any; resolve: Function; reject: Function }> = [];
  
  constructor(workerScript: string) {
    try {
      // Create web worker for heavy computations
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      
      this.worker.onmessage = (event) => {
        const { id, result, error } = event.data;
        const task = this.taskQueue.find(t => t.task.id === id);
        
        if (task) {
          if (error) {
            task.reject(new Error(error));
          } else {
            task.resolve(result);
          }
          this.taskQueue = this.taskQueue.filter(t => t.task.id !== id);
        }
      };
      
      this.worker.onerror = (error) => {
        console.error('Web Worker error:', error);
      };
    } catch (error) {
      console.warn('Web Workers not supported, falling back to main thread');
    }
  }
  
  async executeTask<T>(taskData: any): Promise<T> {
    if (!this.worker) {
      // Fallback to main thread execution
      return this.executeOnMainThread(taskData);
    }
    
    return new Promise((resolve, reject) => {
      const task = {
        ...taskData,
        id: Math.random().toString(36).substr(2, 9)
      };
      
      this.taskQueue.push({ task, resolve, reject });
      this.worker!.postMessage(task);
    });
  }
  
  private executeOnMainThread<T>(taskData: any): Promise<T> {
    // Fallback execution on main thread with setTimeout to prevent blocking
    return new Promise((resolve) => {
      setTimeout(() => {
        // This would contain the actual computation logic
        resolve(taskData as T);
      }, 0);
    });
  }
  
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Data processing worker script
export const dataProcessingWorkerScript = `
  self.onmessage = function(event) {
    const { id, type, data } = event.data;
    
    try {
      let result;
      
      switch (type) {
        case 'processGeoJSON':
          result = processGeoJSONData(data);
          break;
        case 'clusterPoints':
          result = clusterMapPoints(data);
          break;
        case 'filterData':
          result = filterLargeDataset(data);
          break;
        case 'sortData':
          result = sortLargeDataset(data);
          break;
        default:
          throw new Error('Unknown task type: ' + type);
      }
      
      self.postMessage({ id, result });
    } catch (error) {
      self.postMessage({ id, error: error.message });
    }
  };
  
  function processGeoJSONData(data) {
    // Optimized GeoJSON processing
    const features = data.features || [];
    return {
      type: 'FeatureCollection',
      features: features.map(feature => ({
        ...feature,
        properties: {
          ...feature.properties,
          processed: true,
          processedAt: Date.now()
        }
      }))
    };
  }
  
  function clusterMapPoints(data) {
    const { points, zoom } = data;
    const clusters = [];
    const gridSize = 40 / Math.pow(2, zoom - 1);
    
    // Simple grid-based clustering
    const grid = new Map();
    
    points.forEach(point => {
      const x = Math.floor(point.lng / gridSize);
      const y = Math.floor(point.lat / gridSize);
      const key = x + ',' + y;
      
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key).push(point);
    });
    
    for (const [key, points] of grid) {
      if (points.length === 1) {
        clusters.push(points[0]);
      } else {
        const centerLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
        const centerLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
        
        clusters.push({
          type: 'cluster',
          lat: centerLat,
          lng: centerLng,
          count: points.length,
          points: points
        });
      }
    }
    
    return clusters;
  }
  
  function filterLargeDataset(data) {
    const { items, filters } = data;
    
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key] === value || 
               (typeof item[key] === 'string' && item[key].toLowerCase().includes(value.toLowerCase()));
      });
    });
  }
  
  function sortLargeDataset(data) {
    const { items, sortBy, order = 'asc' } = data;
    
    return items.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (order === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }
`;

// Create singleton web worker for data processing
let dataWorker: PerformanceWebWorker | null = null;

export const getDataWorker = () => {
  if (!dataWorker) {
    dataWorker = new PerformanceWebWorker(dataProcessingWorkerScript);
  }
  return dataWorker;
};

// Cleanup function
export const cleanupWebWorkers = () => {
  if (dataWorker) {
    dataWorker.terminate();
    dataWorker = null;
  }
};