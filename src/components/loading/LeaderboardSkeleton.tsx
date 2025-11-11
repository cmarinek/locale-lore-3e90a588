import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const LeaderboardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* User Rank Banner Skeleton */}
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        {/* Leaderboard Entries Skeleton */}
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <LeaderboardEntrySkeleton key={i} rank={i + 1} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

export const LeaderboardEntrySkeleton = ({ rank }: { rank: number }) => {
  const getGradient = () => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2: return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default: return 'from-muted/20 to-muted/30 border-border';
    }
  };

  return (
    <div className={`p-3 rounded-lg border bg-gradient-to-r ${getGradient()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {rank <= 3 && <Skeleton className="h-5 w-5" />}
      </div>
    </div>
  );
};
