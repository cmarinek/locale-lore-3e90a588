import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { LocationClaim } from '@/types/contributor';
import { Loader2, MapPin, ShieldCheck, AlertTriangle, Compass } from 'lucide-react';
import { log } from '@/utils/logger';

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border border-amber-200',
  verified: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  rejected: 'bg-destructive/10 text-destructive border border-destructive/20',
};

const benefitLabels: Record<keyof LocationClaim['benefits_enabled'], string> = {
  promotional_posts: 'Promotional Posts',
  special_offers: 'Special Offers',
  event_notifications: 'Event Notifications',
  analytics_access: 'Analytics Access',
};

const formatStatusLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const normalizeClaim = (record: any): LocationClaim => ({
  id: record.id,
  user_id: record.user_id,
  location_name: record.location_name,
  latitude: Number(record.latitude ?? 0),
  longitude: Number(record.longitude ?? 0),
  business_name: record.business_name ?? undefined,
  business_type: record.business_type ?? undefined,
  claim_status: record.claim_status,
  verification_documents: Array.isArray(record.verification_documents)
    ? record.verification_documents
    : [],
  claimed_at: record.claimed_at,
  verified_at: record.verified_at ?? undefined,
  verified_by: record.verified_by ?? undefined,
  benefits_enabled: {
    promotional_posts: Boolean(record.benefits_enabled?.promotional_posts),
    special_offers: Boolean(record.benefits_enabled?.special_offers),
    event_notifications: Boolean(record.benefits_enabled?.event_notifications),
    analytics_access: Boolean(record.benefits_enabled?.analytics_access),
  },
});

export const LocationClaimsManager: React.FC = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState<LocationClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClaims = async () => {
      if (!user) {
        setClaims([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('location_claims')
          .select('*')
          .eq('user_id', user.id)
          .order('claimed_at', { ascending: false });

        if (error) throw error;

        const normalized = (data || []).map(normalizeClaim);
        setClaims(normalized);
      } catch (error: any) {
        log.error('Failed to load location claims', error, { component: 'LocationClaimsManager', userId: user?.id });
        setClaims([]);
      } finally {
        setLoading(false);
      }
    };

    loadClaims();
  }, [user]);

  const summary = useMemo(() => {
    const verified = claims.filter((claim) => claim.claim_status === 'verified').length;
    const pending = claims.filter((claim) => claim.claim_status === 'pending').length;
    const rejected = claims.filter((claim) => claim.claim_status === 'rejected').length;

    return {
      total: claims.length,
      verified,
      pending,
      rejected,
    };
  }, [claims]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Claims</CardTitle>
          <CardDescription>Sign in as a contributor to manage claimed locations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Location Claims</CardTitle>
          <CardDescription>Manage verification for the locations where you are the official storyteller.</CardDescription>
        </div>
        <Button asChild size="sm">
          <a href="/submit?type=location-claim">Start a new claim</a>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Total Claims</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </div>
          <div className="rounded-lg border bg-emerald-50 p-4">
            <p className="text-xs text-emerald-700">Verified</p>
            <p className="text-2xl font-semibold text-emerald-700">{summary.verified}</p>
          </div>
          <div className="rounded-lg border bg-amber-50 p-4">
            <p className="text-xs text-amber-700">Pending</p>
            <p className="text-2xl font-semibold text-amber-700">{summary.pending}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading location claims…
          </div>
        ) : claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No locations claimed yet</p>
              <p className="text-sm text-muted-foreground">
                Claim a business or landmark to unlock promotional benefits and analytics access.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{claim.location_name}</h3>
                    {claim.business_name && (
                      <p className="text-sm text-muted-foreground">{claim.business_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {claim.business_type ? `${claim.business_type} · ` : ''}Lat {claim.latitude.toFixed(4)}, Lng {claim.longitude.toFixed(4)}
                    </p>
                  </div>
                  <Badge className={statusBadgeClasses[claim.claim_status] ?? 'bg-muted text-muted-foreground border border-muted'}>
                    {formatStatusLabel(claim.claim_status)}
                  </Badge>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Compass className="h-3 w-3" /> Claimed
                    </p>
                    <p className="font-medium">{new Date(claim.claimed_at).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3 w-3" /> Verification
                    </p>
                    <p className="font-medium">
                      {claim.verified_at ? new Date(claim.verified_at).toLocaleDateString() : 'Pending review'}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3 w-3" /> Documents
                    </p>
                    <p className="font-medium">{claim.verification_documents.length}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Enabled benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(claim.benefits_enabled).map(([benefit, enabled]) => (
                      <Badge
                        key={benefit}
                        variant={enabled ? 'default' : 'outline'}
                        className={enabled ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
                      >
                        {benefitLabels[benefit as keyof LocationClaim['benefits_enabled']]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationClaimsManager;
