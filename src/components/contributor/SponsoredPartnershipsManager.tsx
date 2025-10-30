import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { SponsoredPartnership } from '@/types/contributor';
import { Loader2, ExternalLink } from 'lucide-react';

const formatLabel = (value: string) =>
  value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const statusColorMap: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-destructive/10 text-destructive',
};

export const SponsoredPartnershipsManager: React.FC = () => {
  const { user } = useAuth();
  const [partnerships, setPartnerships] = useState<SponsoredPartnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPartnerships = async () => {
      if (!user) {
        setPartnerships([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sponsored_partnerships')
          .select('*')
          .or(`creator_id.eq.${user.id},brand_id.eq.${user.id}`)
          .order('start_date', { ascending: false });

        if (error) throw error;

        const normalized = (data ?? []).map((record: any) => ({
          ...record,
          budget: Number(record.budget ?? 0),
          requirements: Array.isArray(record.requirements) ? record.requirements : [],
          deliverables: Array.isArray(record.deliverables) ? record.deliverables : [],
        }));

        setPartnerships(normalized as SponsoredPartnership[]);
      } catch (error) {
        console.error('Error loading partnerships:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartnerships();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sponsored Partnerships</CardTitle>
          <CardDescription>Sign in as a contributor to manage partnerships.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsored Partnerships</CardTitle>
        <CardDescription>Track collaborations with brands and local businesses.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading partnerships…
          </div>
        ) : partnerships.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You don’t have any active partnerships yet. Pitch your favorite locations to a brand to get started.
          </p>
        ) : (
          partnerships.map((partnership) => (
            <div key={partnership.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{partnership.title}</h3>
                  <p className="text-xs text-muted-foreground">{formatLabel(partnership.campaign_type)}</p>
                </div>
                <Badge className={statusColorMap[partnership.status] ?? 'bg-muted text-muted-foreground'}>
                  {formatLabel(partnership.status)}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>{partnership.description}</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-semibold">${partnership.budget.toLocaleString()}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-muted-foreground">Timeline</p>
                  <p className="font-semibold">
                    {new Date(partnership.start_date).toLocaleDateString()} – {new Date(partnership.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-muted-foreground">Deliverables</p>
                  <p className="font-semibold">{partnership.deliverables.length}</p>
              </div>
            </div>

              {partnership.requirements.length > 0 && (
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    {partnership.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-end">
                <Button variant="ghost" size="sm">
                  View details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SponsoredPartnershipsManager;
