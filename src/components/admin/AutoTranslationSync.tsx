import { useState } from 'react';
import { useTranslationFiles } from '@/hooks/useTranslationFiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AutoTranslationSync = () => {
  const { progress, bulkTranslate, reloadTranslations, loading } = useTranslationFiles();
  const [syncing, setSyncing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAutoTranslate = async (language: string, namespace: string, missingKeys: string[]) => {
    setSyncing(`${language}-${namespace}`);
    try {
      await bulkTranslate(language, namespace, missingKeys);
      toast({
        title: 'Translation Complete',
        description: `Successfully translated ${missingKeys.length} keys for ${language}/${namespace}`,
      });
    } catch (error) {
      toast({
        title: 'Translation Failed',
        description: error instanceof Error ? error.message : 'Failed to auto-translate',
        variant: 'destructive',
      });
    } finally {
      setSyncing(null);
    }
  };

  const incompleteTranslations = progress.filter(p => p.percentage < 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Auto Translation Sync</h3>
          <p className="text-sm text-muted-foreground">
            Automatically detect and translate missing keys using AI
          </p>
        </div>
        <Button
          onClick={reloadTranslations}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {incompleteTranslations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-semibold">All translations complete!</p>
            <p className="text-sm text-muted-foreground">No missing keys detected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {incompleteTranslations.map((item) => (
            <Card key={`${item.language}-${item.namespace}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {item.language.toUpperCase()} - {item.namespace}
                    </CardTitle>
                    <CardDescription>
                      {item.missing.length} missing keys ({item.percentage}% complete)
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleAutoTranslate(item.language, item.namespace, item.missing)}
                    disabled={syncing === `${item.language}-${item.namespace}` || loading}
                    size="sm"
                  >
                    {syncing === `${item.language}-${item.namespace}` ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Auto Translate
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {item.missing.slice(0, 10).map((key) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}
                    </Badge>
                  ))}
                  {item.missing.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.missing.length - 10} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
