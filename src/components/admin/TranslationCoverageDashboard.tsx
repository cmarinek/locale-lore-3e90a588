import React from 'react';
import { useTranslationFiles } from '@/hooks/useTranslationFiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Languages } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const TranslationCoverageDashboard: React.FC = () => {
  const { progress, loading } = useTranslationFiles();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group progress by language
  const languageGroups = progress.reduce((acc, item) => {
    if (!acc[item.language]) {
      acc[item.language] = [];
    }
    acc[item.language].push(item);
    return acc;
  }, {} as Record<string, typeof progress>);

  // Calculate overall stats
  const totalKeys = progress.reduce((sum, item) => sum + item.total, 0);
  const translatedKeys = progress.reduce((sum, item) => sum + item.translated, 0);
  const overallPercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Coverage Overview
          </CardTitle>
          <CardDescription>
            Track translation completion across all languages and namespaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-2xl font-bold">{overallPercentage}%</span>
          </div>
          <Progress value={overallPercentage} className="h-3" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Keys: </span>
              <span className="font-semibold">{totalKeys.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Translated: </span>
              <span className="font-semibold">{translatedKeys.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language-specific Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Language Coverage</CardTitle>
          <CardDescription>Detailed breakdown by language and namespace</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(languageGroups).map(([langCode, namespaces]) => {
              const langTotal = namespaces.reduce((sum, ns) => sum + ns.total, 0);
              const langTranslated = namespaces.reduce((sum, ns) => sum + ns.translated, 0);
              const langPercentage = langTotal > 0 ? Math.round((langTranslated / langTotal) * 100) : 0;
              const langInfo = SUPPORTED_LANGUAGES[langCode as keyof typeof SUPPORTED_LANGUAGES];

              return (
                <AccordionItem key={langCode} value={langCode}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{langInfo?.flag || '🌍'}</span>
                        <div className="text-left">
                          <div className="font-medium">{langInfo?.name || langCode.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {langTranslated} / {langTotal} keys
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={langPercentage === 100 ? "default" : langPercentage >= 80 ? "secondary" : "outline"}
                          className="ml-2"
                        >
                          {langPercentage}%
                        </Badge>
                        {langPercentage === 100 ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : langPercentage < 50 ? (
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                        ) : null}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {namespaces.map((ns) => (
                        <div key={ns.namespace} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">{ns.namespace}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {ns.translated} / {ns.total}
                              </span>
                              <Badge variant={ns.percentage === 100 ? "default" : "outline"} className="w-14 justify-center">
                                {ns.percentage}%
                              </Badge>
                            </div>
                          </div>
                          <Progress value={ns.percentage} className="h-2" />
                          {ns.missing.length > 0 && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                {ns.missing.length} missing keys
                              </summary>
                              <ul className="mt-2 space-y-1 pl-4 list-disc text-muted-foreground">
                                {ns.missing.slice(0, 10).map((key) => (
                                  <li key={key} className="font-mono">{key}</li>
                                ))}
                                {ns.missing.length > 10 && (
                                  <li className="text-muted-foreground italic">
                                    ...and {ns.missing.length - 10} more
                                  </li>
                                )}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
