
import { createClient } from '@supabase/supabase-js';

// Database connection pool configuration
export interface PoolConfig {
  maxConnections: number;
  idleTimeout: number;
  acquireTimeout: number;
  reapInterval: number;
}

export class DatabasePool {
  private pools: Map<string, any> = new Map();
  private config: PoolConfig;

  constructor(config: PoolConfig = {
    maxConnections: 100,
    idleTimeout: 30000,
    acquireTimeout: 10000,
    reapInterval: 1000
  }) {
    this.config = config;
  }

  // Create read replica connections for read-heavy operations
  getReadClient() {
    const readReplicaUrl = import.meta.env.VITE_SUPABASE_READ_REPLICA_URL || import.meta.env.VITE_SUPABASE_URL;
    
    if (!this.pools.has('read')) {
      this.pools.set('read', createClient(
        readReplicaUrl,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-connection-type': 'read-replica'
            }
          }
        }
      ));
    }
    
    return this.pools.get('read');
  }

  // Main write client
  getWriteClient() {
    if (!this.pools.has('write')) {
      this.pools.set('write', createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-connection-type': 'write-primary'
            }
          }
        }
      ));
    }
    
    return this.pools.get('write');
  }

  // Analytics read client (separate from main read replica)
  getAnalyticsClient() {
    const analyticsUrl = import.meta.env.VITE_SUPABASE_ANALYTICS_URL || import.meta.env.VITE_SUPABASE_URL;
    
    if (!this.pools.has('analytics')) {
      this.pools.set('analytics', createClient(
        analyticsUrl,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          db: {
            schema: 'public'
          },
          global: {
            headers: {
              'x-connection-type': 'analytics-replica'
            }
          }
        }
      ));
    }
    
    return this.pools.get('analytics');
  }

  // Close all connections
  closeAll() {
    for (const [key, client] of this.pools) {
      try {
        // Supabase clients don't have explicit close method
        // but we can clear the pools
        console.log(`Closing connection pool: ${key}`);
      } catch (error) {
        console.error(`Error closing pool ${key}:`, error);
      }
    }
    this.pools.clear();
  }
}

export const dbPool = new DatabasePool();
