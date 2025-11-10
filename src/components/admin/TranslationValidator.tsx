import { useState } from 'react';
import { useTranslationFiles } from '@/hooks/useTranslationFiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, XCircle, FileSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ValidationIssue {
  key: string;
  language: string;
  namespace: string;
  type: 'missing_placeholder' | 'format_mismatch' | 'special_char' | 'empty_value';
  message: string;
  severity: 'error' | 'warning';
}

export const TranslationValidator = () => {
  const { progress, loading } = useTranslationFiles();
  const [validating, setValidating] = useState(false);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const { toast } = useToast();

  const validateTranslations = async () => {
    setValidating(true);
    const foundIssues: ValidationIssue[] = [];

    try {
      // Load English as reference
      for (const item of progress) {
        const enResponse = await fetch(`/locales/en/${item.namespace}.json`);
        const targetResponse = await fetch(`/locales/${item.language}/${item.namespace}.json`);

        if (!enResponse.ok || !targetResponse.ok) continue;

        const enData = await enResponse.json();
        const targetData = await targetResponse.json();

        // Check each key in English
        const checkKey = (enKey: string, enValue: any, targetValue: any, path: string = '') => {
          const fullKey = path ? `${path}.${enKey}` : enKey;

          if (typeof enValue === 'object' && enValue !== null) {
            // Recurse for nested objects
            if (typeof targetValue === 'object' && targetValue !== null) {
              Object.keys(enValue).forEach(subKey => {
                checkKey(subKey, enValue[subKey], targetValue?.[subKey], fullKey);
              });
            }
            return;
          }

          if (typeof enValue !== 'string') return;

          // Check for missing or empty values
          if (!targetValue || targetValue.trim() === '') {
            foundIssues.push({
              key: fullKey,
              language: item.language,
              namespace: item.namespace,
              type: 'empty_value',
              message: 'Translation is missing or empty',
              severity: 'error'
            });
            return;
          }

          // Check for placeholders
          const enPlaceholders = enValue.match(/\{\{[^}]+\}\}/g) || [];
          const targetPlaceholders = targetValue.match(/\{\{[^}]+\}\}/g) || [];

          if (enPlaceholders.length !== targetPlaceholders.length) {
            foundIssues.push({
              key: fullKey,
              language: item.language,
              namespace: item.namespace,
              type: 'missing_placeholder',
              message: `Placeholder mismatch: expected ${enPlaceholders.length}, found ${targetPlaceholders.length}`,
              severity: 'error'
            });
          }

          // Check for format strings (%s, %d, etc.)
          const enFormatStrings = enValue.match(/%[sd]/g) || [];
          const targetFormatStrings = targetValue.match(/%[sd]/g) || [];

          if (enFormatStrings.length !== targetFormatStrings.length) {
            foundIssues.push({
              key: fullKey,
              language: item.language,
              namespace: item.namespace,
              type: 'format_mismatch',
              message: `Format string mismatch: expected ${enFormatStrings.length}, found ${targetFormatStrings.length}`,
              severity: 'error'
            });
          }

          // Check for special characters that might have been corrupted
          const hasSpecialChars = /[<>{}[\]\\]/g.test(enValue);
          if (hasSpecialChars) {
            const enSpecialChars = (enValue.match(/[<>{}[\]\\]/g) || []).sort().join('');
            const targetSpecialChars = (targetValue.match(/[<>{}[\]\\]/g) || []).sort().join('');

            if (enSpecialChars !== targetSpecialChars) {
              foundIssues.push({
                key: fullKey,
                language: item.language,
                namespace: item.namespace,
                type: 'special_char',
                message: 'Special characters do not match',
                severity: 'warning'
              });
            }
          }
        };

        Object.keys(enData).forEach(key => {
          checkKey(key, enData[key], targetData[key]);
        });
      }

      setIssues(foundIssues);
      toast({
        title: 'Validation Complete',
        description: `Found ${foundIssues.length} issue${foundIssues.length !== 1 ? 's' : ''} across all translations`,
      });
    } catch (error) {
      console.error('Validation failed:', error);
      toast({
        title: 'Validation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  const errorIssues = issues.filter(i => i.severity === 'error');
  const warningIssues = issues.filter(i => i.severity === 'warning');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Translation Validation</h3>
          <p className="text-sm text-muted-foreground">
            Check for missing placeholders, formatting inconsistencies, and special characters
          </p>
        </div>
        <Button
          onClick={validateTranslations}
          disabled={validating || loading}
          variant="outline"
        >
          {validating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <FileSearch className="h-4 w-4 mr-2" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {issues.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {progress.reduce((sum, p) => sum + p.translated, 0) - issues.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Valid Translations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{errorIssues.length}</p>
                  <p className="text-xs text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{warningIssues.length}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {issues.length === 0 && !validating && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            No validation run yet. Click "Run Validation" to check all translations.
          </AlertDescription>
        </Alert>
      )}

      {issues.length > 0 && (
        <Tabs defaultValue="errors" className="w-full">
          <TabsList>
            <TabsTrigger value="errors">
              Errors ({errorIssues.length})
            </TabsTrigger>
            <TabsTrigger value="warnings">
              Warnings ({warningIssues.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="space-y-2">
            {errorIssues.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>No errors found!</AlertDescription>
              </Alert>
            ) : (
              errorIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-mono">
                          {issue.language}/{issue.namespace}.{issue.key}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {issue.message}
                        </CardDescription>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {issue.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-2">
            {warningIssues.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>No warnings found!</AlertDescription>
              </Alert>
            ) : (
              warningIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-mono">
                          {issue.language}/{issue.namespace}.{issue.key}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {issue.message}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {issue.type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
