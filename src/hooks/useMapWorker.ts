// Ultra-fast map worker hook for 2025 performance
import { useRef, useCallback, useEffect } from 'react';
import { FactMarker } from '@/types/map';
import { log } from '@/utils/logger';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface WorkerTask {
  id: string;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
}

export const useMapWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const tasksRef = useRef<Map<string, WorkerTask>>(new Map());
  const taskIdCounter = useRef(0);

  // Initialize worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        // Create worker from blob for immediate availability
        const workerBlob = new Blob([`
          // Inline worker code for maximum performance
          const self = this;
          
          function clusterFacts(facts, zoom, bounds) {
            if (zoom > 14) return [];
            
            const gridSize = zoom <= 2 ? 10.0 : zoom <= 4 ? 5.0 : zoom <= 6 ? 2.0 : zoom <= 8 ? 1.0 : zoom <= 10 ? 0.5 : zoom <= 12 ? 0.25 : 0.1;
            const clusters = new Map();
            
            for (const fact of facts) {
              if (fact.latitude < bounds.south || fact.latitude > bounds.north || 
                  fact.longitude < bounds.west || fact.longitude > bounds.east) continue;
              
              const gridX = Math.floor(fact.longitude / gridSize);
              const gridY = Math.floor(fact.latitude / gridSize);
              const key = gridX + '_' + gridY;
              
              if (clusters.has(key)) {
                const cluster = clusters.get(key);
                cluster.count++;
                cluster.facts.push(fact);
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
            
            const minSize = zoom <= 6 ? 5 : zoom <= 10 ? 3 : 2;
            return Array.from(clusters.values()).filter(c => c.count >= minSize);
          }
          
          function processGeoJSON(facts) {
            return {
              type: 'FeatureCollection',
              features: facts.map(fact => ({
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
              }))
            };
          }
          
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
                  result = processGeoJSON(data.facts);
                  break;
                case 'filterByBounds':
                  result = data.facts.filter(fact => 
                    fact.latitude >= data.bounds.south &&
                    fact.latitude <= data.bounds.north &&
                    fact.longitude >= data.bounds.west &&
                    fact.longitude <= data.bounds.east
                  );
                  break;
                default:
                  throw new Error('Unknown task type: ' + type);
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
                error: error.message || 'Unknown error'
              });
            }
          };
          
          self.postMessage({ type: 'ready' });
        `], { type: 'application/javascript' });

        workerRef.current = new Worker(URL.createObjectURL(workerBlob));

        workerRef.current.onmessage = (e) => {
          const { id, type, result, error } = e.data;
          
          if (type === 'ready') {
            log.info('MapWorker ready for processing', { component: 'useMapWorker' });
            return;
          }
          
          const task = tasksRef.current.get(id);
          if (task) {
            tasksRef.current.delete(id);
            
            if (type === 'success') {
              task.resolve(result);
            } else if (type === 'error') {
              task.reject(new Error(error));
            }
          }
        };

        workerRef.current.onerror = (error) => {
          log.error('MapWorker error', error, { component: 'useMapWorker' });
        };

      } catch (error) {
        log.warn('MapWorker not available, falling back to main thread', { component: 'useMapWorker' });
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const executeTask = useCallback(<T>(type: string, data: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback to main thread processing
        try {
          let result;
          switch (type) {
            case 'filterByBounds':
              result = data.facts.filter((fact: FactMarker) => 
                fact.latitude >= data.bounds.south &&
                fact.latitude <= data.bounds.north &&
                fact.longitude >= data.bounds.west &&
                fact.longitude <= data.bounds.east
              );
              break;
            case 'processGeoJSON':
              result = {
                type: 'FeatureCollection',
                features: data.facts.map((fact: FactMarker) => ({
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
                }))
              };
              break;
            default:
              throw new Error(`Unsupported task type: ${type}`);
          }
          resolve(result);
        } catch (error) {
          reject(error);
        }
        return;
      }

      const id = `task_${++taskIdCounter.current}`;
      tasksRef.current.set(id, { id, resolve, reject });

      workerRef.current.postMessage({
        id,
        type,
        data
      });
    });
  }, []);

  const clusterFacts = useCallback((facts: FactMarker[], zoom: number, bounds: ViewportBounds) => {
    return executeTask('clusterFacts', { facts, zoom, bounds });
  }, [executeTask]);

  const processGeoJSON = useCallback((facts: FactMarker[]) => {
    return executeTask('processGeoJSON', { facts });
  }, [executeTask]);

  const filterByBounds = useCallback((facts: FactMarker[], bounds: ViewportBounds) => {
    return executeTask('filterByBounds', { facts, bounds });
  }, [executeTask]);

  return {
    clusterFacts,
    processGeoJSON,
    filterByBounds,
    isWorkerAvailable: !!workerRef.current
  };
};