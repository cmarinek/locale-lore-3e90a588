/**
 * Performance Monitoring Dashboard
 * Shows real-time metrics for deduplication, caching, and prefetching
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Zap, Database, Network, TrendingUp } from 'lucide-react';
import { requestDeduplicator } from '@/utils/requestDeduplication';
import { smartPrefetcher } from '@/hooks/useSmartPrefetch';
import { profileCache, categoryCache, factCache } from '@/utils/lruCache';
import { networkAdapter, useNetworkAdapter } from '@/utils/networkAdapter';

export const PerformanceDashboard: React.FC = () => {
  const [dedupeStats, setDedupeStats] = useState(requestDeduplicator.getStats());
  const [prefetchStats, setPrefetchStats] = useState(smartPrefetcher.getStats());
  const [profileCacheStats, setProfileCacheStats] = useState(profileCache.getStats());
  const [categoryCacheStats, setCategoryCacheStats] = useState(categoryCache.getStats());
  const [factCacheStats, setFactCacheStats] = useState(factCache.getStats());
  
  const { networkInfo, strategy, qualityScore } = useNetworkAdapter();

  // Update stats every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDedupeStats(requestDeduplicator.getStats());
      setPrefetchStats(smartPrefetcher.getStats());
      setProfileCacheStats(profileCache.getStats());
      setCategoryCacheStats(categoryCache.getStats());
      setFactCacheStats(factCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getNetworkBadge = () => {
    const speed = networkInfo.speed;
    const colors: Record<string, string> = {
      'slow-2g': 'destructive',
      '2g': 'destructive',
      '3g': 'secondary',
      '4g': 'default',
      'fast': 'default',
    };
    
    return (
      <Badge variant={colors[speed] as any}>
        {speed.toUpperCase()}
      </Badge>
    );
  };

  const getTotalCacheStats = () => {
    const totalHits = profileCacheStats.hits + categoryCacheStats.hits + factCacheStats.hits;
    const totalMisses = profileCacheStats.misses + categoryCacheStats.misses + factCacheStats.misses;
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    return { totalHits, totalMisses, hitRate };
  };

  const cacheStats = getTotalCacheStats();

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground text-sm">Real-time optimization metrics</p>
        </div>
        {getNetworkBadge()}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deduplication">Deduplication</TabsTrigger>
          <TabsTrigger value="caching">Caching</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats.hitRate.toFixed(1)}%</div>
                <Progress value={cacheStats.hitRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {cacheStats.totalHits} hits, {cacheStats.totalMisses} misses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Requests Saved</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dedupeStats.savedRequests}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {dedupeStats.deduplicationRate.toFixed(1)}% deduplication rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prefetch Queue</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{prefetchStats.queueLength}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {prefetchStats.cacheSize} cached items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Quality</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{qualityScore}/100</div>
                <Progress value={qualityScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {networkInfo.effectiveType} • {networkInfo.saveData ? 'Data Saver ON' : 'Full Speed'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deduplication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Deduplication</CardTitle>
              <CardDescription>
                Prevents identical requests from executing simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold">{dedupeStats.pendingRequests}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Subscribers</p>
                  <p className="text-3xl font-bold">{dedupeStats.totalSubscribers}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Deduplication Rate</p>
                  <p className="text-sm text-muted-foreground">
                    {dedupeStats.deduplicationRate.toFixed(1)}%
                  </p>
                </div>
                <Progress value={dedupeStats.deduplicationRate} />
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {dedupeStats.savedRequests} redundant requests prevented
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="caching" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Cache</CardTitle>
                <CardDescription>User profile data (10 min TTL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hit Rate</span>
                  <span className="text-sm font-medium">{profileCacheStats.hitRate.toFixed(1)}%</span>
                </div>
                <Progress value={profileCacheStats.hitRate} />
                <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                  <div>Hits: {profileCacheStats.hits}</div>
                  <div>Misses: {profileCacheStats.misses}</div>
                  <div>Size: {profileCacheStats.size}/{profileCacheStats.maxSize}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Cache</CardTitle>
                <CardDescription>Category data (30 min TTL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hit Rate</span>
                  <span className="text-sm font-medium">{categoryCacheStats.hitRate.toFixed(1)}%</span>
                </div>
                <Progress value={categoryCacheStats.hitRate} />
                <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                  <div>Hits: {categoryCacheStats.hits}</div>
                  <div>Misses: {categoryCacheStats.misses}</div>
                  <div>Size: {categoryCacheStats.size}/{categoryCacheStats.maxSize}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fact Cache</CardTitle>
                <CardDescription>Fact data (5 min TTL)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Hit Rate</span>
                  <span className="text-sm font-medium">{factCacheStats.hitRate.toFixed(1)}%</span>
                </div>
                <Progress value={factCacheStats.hitRate} />
                <div className="grid grid-cols-3 gap-2 pt-2 text-xs text-muted-foreground">
                  <div>Hits: {factCacheStats.hits}</div>
                  <div>Misses: {factCacheStats.misses}</div>
                  <div>Size: {factCacheStats.size}/{factCacheStats.maxSize}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network-Aware Optimization</CardTitle>
              <CardDescription>
                Adaptive strategies based on connection quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-medium">Connection Quality</p>
                  <p className="text-sm text-muted-foreground">{qualityScore}/100</p>
                </div>
                <Progress value={qualityScore} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Effective Type</p>
                  <p className="text-lg font-semibold">{networkInfo.effectiveType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data Saver</p>
                  <p className="text-lg font-semibold">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium">Active Strategy</h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Prefetch Enabled</p>
                    <p className="font-medium">{strategy.prefetchEnabled ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Batch Delay</p>
                    <p className="font-medium">{strategy.batchDelay}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cache Size</p>
                    <p className="font-medium">{strategy.cacheSize}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Image Quality</p>
                    <p className="font-medium">{strategy.imageQuality}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
