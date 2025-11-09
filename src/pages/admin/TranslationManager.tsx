import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Languages, RefreshCw, CheckCircle, AlertCircle, Download, Upload, Zap, FileEdit } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/utils/languages';
import { useTranslation } from 'react-i18next';
import { batchDownloadTranslations, generateUploadInstructions, logSyncSummary, TranslationUpdate, TranslationSyncResult } from '@/utils/translationFileWriter';

const NAMESPACES = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

export const TranslationManager: React.FC = () => {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('es');
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [progress, setProgress] = useState<Record<string, any>>({});

  const loadTranslationFile = async (language: string, namespace: string) => {
    try {
      const response = await fetch(`/locales/${language}/${namespace}.json`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Failed to load ${language}/${namespace}:`, error);
      return null;
    }
  };

  const analyzeTranslations = async () => {
    setIsAnalyzing(true);
    try {
      const sourceTranslations = await loadTranslationFile('en', selectedNamespace);
      const targetTranslations = await loadTranslationFile(selectedLanguage, selectedNamespace);

      if (!sourceTranslations) {
        toast({
          title: 'Error',
          description: `Source translation file not found for ${selectedNamespace}`,
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('detect-missing-translations', {
        body: {
          sourceTranslations,
          targetTranslations: targetTranslations || {}
        }
      });

      if (error) throw error;

      setAnalysisResults(data);
      toast({
        title: 'Analysis Complete',
        description: `${data.completionPercentage}% translated (${data.translatedKeys}/${data.totalKeys} keys)`
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const translateMissingKeys = async () => {
    setIsTranslating(true);
    try {
      const sourceTranslations = await loadTranslationFile('en', selectedNamespace);
      
      if (!sourceTranslations) {
        throw new Error('Source translations not found');
      }

      toast({
        title: 'Translation Started',
        description: `Translating ${selectedNamespace} to ${SUPPORTED_LANGUAGES[selectedLanguage].name}...`
      });

      const { data, error } = await supabase.functions.invoke('translation-sync', {
        body: {
          sourceLanguage: 'English',
          targetLanguage: SUPPORTED_LANGUAGES[selectedLanguage].name,
          translations: sourceTranslations,
          namespace: selectedNamespace
        }
      });

      if (error) throw error;

      // Create downloadable file
      const blob = new Blob([JSON.stringify(data.translations, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedLanguage}-${selectedNamespace}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Translation Complete',
        description: `${data.count} keys translated. File downloaded. Please upload to repository.`
      });

      // Re-analyze after translation
      await analyzeTranslations();
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        title: 'Translation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const syncAllMissingTranslations = async () => {
    setIsTranslating(true);
    const translationUpdates: TranslationUpdate[] = [];
    const syncResults: TranslationSyncResult[] = [];
    
    try {
      toast({
        title: 'Full Sync Started',
        description: 'Analyzing and translating all missing keys across all languages...'
      });

      for (const langCode of Object.keys(SUPPORTED_LANGUAGES)) {
        if (langCode === 'en') continue;

        for (const namespace of NAMESPACES) {
          const sourceTranslations = await loadTranslationFile('en', namespace);
          const targetTranslations = await loadTranslationFile(langCode, namespace);

          if (!sourceTranslations) continue;

          // Check if translations are needed
          const { data: analysisData } = await supabase.functions.invoke('detect-missing-translations', {
            body: {
              sourceTranslations,
              targetTranslations: targetTranslations || {}
            }
          });

          if (analysisData) {
            syncResults.push({
              language: SUPPORTED_LANGUAGES[langCode as SupportedLanguage].name,
              namespace,
              totalKeys: analysisData.totalKeys,
              translatedKeys: analysisData.translatedKeys,
              completionPercentage: analysisData.completionPercentage,
              missingKeys: analysisData.missingKeys || [],
              emptyKeys: analysisData.emptyKeys || []
            });

            if (analysisData.missingKeys.length > 0 || analysisData.emptyKeys.length > 0) {
              // Translate missing keys
              const { data: translationData, error } = await supabase.functions.invoke('translation-sync', {
                body: {
                  sourceLanguage: 'English',
                  targetLanguage: SUPPORTED_LANGUAGES[langCode as SupportedLanguage].name,
                  translations: sourceTranslations,
                  namespace
                }
              });

              if (!error && translationData) {
                translationUpdates.push({
                  language: langCode as SupportedLanguage,
                  namespace,
                  translations: translationData.translations,
                  keysUpdated: translationData.count
                });

                // Small delay to avoid overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            }
          }
        }
      }

      // Batch download all updated files
      if (translationUpdates.length > 0) {
        batchDownloadTranslations(translationUpdates);
        
        // Generate and log instructions
        const instructions = generateUploadInstructions(translationUpdates);
        console.log(instructions);
        
        // Log summary
        logSyncSummary(syncResults);

        toast({
          title: 'Full Sync Complete',
          description: `${translationUpdates.length} files updated and downloaded. Check console for upload instructions.`,
          duration: 10000
        });
      } else {
        toast({
          title: 'Already Up to Date',
          description: 'All translations are complete. No updates needed.'
        });
      }
      
    } catch (error) {
      console.error('Full sync failed:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const analyzeAllLanguages = async () => {
    setIsAnalyzing(true);
    const results: Record<string, any> = {};

    try {
      const sourceTranslations = await loadTranslationFile('en', selectedNamespace);
      if (!sourceTranslations) throw new Error('Source file not found');

      for (const langCode of Object.keys(SUPPORTED_LANGUAGES)) {
        if (langCode === 'en') continue;

        const targetTranslations = await loadTranslationFile(langCode, selectedNamespace);

        const { data } = await supabase.functions.invoke('detect-missing-translations', {
          body: {
            sourceTranslations,
            targetTranslations: targetTranslations || {}
          }
        });

        if (data) {
          results[langCode] = data;
        }
      }

      setProgress(results);
      toast({
        title: 'Global Analysis Complete',
        description: `Analyzed ${Object.keys(results).length} languages`
      });
    } catch (error) {
      console.error('Global analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Languages className="h-8 w-8" />
            {t('translationManagement.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and sync translations across all languages using AI-powered translation
          </p>
        </div>
      </div>

      <Alert className="mb-6">
        <FileEdit className="h-4 w-4" />
        <AlertDescription>
          <strong>Auto-Sync Feature:</strong> Click "Full Auto-Sync" to automatically detect and translate all missing keys across all languages and namespaces. 
          Files will be downloaded automatically. Upload them to <code className="bg-muted px-1 rounded">public/locales/</code> to apply changes.
        </AlertDescription>
      </Alert>

      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Full Auto-Sync
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically scan all languages and translate missing keys using OpenAI
            </p>
          </div>
          <Button 
            onClick={syncAllMissingTranslations} 
            disabled={isTranslating || isAnalyzing}
            size="lg"
            className="gap-2"
          >
            {isTranslating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Syncing...</>
            ) : (
              <><Zap className="h-4 w-4" /> Run Full Sync</>
            )}
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="single" className="space-y-6">
        <TabsList>
          <TabsTrigger value="single">Single Language</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Language</label>
                  <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as SupportedLanguage)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUPPORTED_LANGUAGES).filter(([code]) => code !== 'en').map(([code, lang]) => (
                        <SelectItem key={code} value={code}>
                          {lang.flag} {lang.nativeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Namespace</label>
                  <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMESPACES.map(ns => (
                        <SelectItem key={ns} value={ns}>{ns}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={analyzeTranslations} disabled={isAnalyzing || isTranslating}>
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Analyze</>
                  )}
                </Button>
                <Button 
                  onClick={translateMissingKeys} 
                  disabled={isTranslating || isAnalyzing || !analysisResults}
                  variant="default"
                >
                  {isTranslating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Translating...</>
                  ) : (
                    <><Languages className="mr-2 h-4 w-4" /> Auto-Translate</>
                  )}
                </Button>
              </div>

              {analysisResults && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Translation Progress</span>
                    <Badge variant={analysisResults.completionPercentage === 100 ? 'default' : 'secondary'}>
                      {analysisResults.completionPercentage}%
                    </Badge>
                  </div>
                  <Progress value={analysisResults.completionPercentage} className="h-2" />
                  
                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">{analysisResults.translatedKeys}</div>
                        <div className="text-xs text-muted-foreground">Translated</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-sm font-medium">{analysisResults.missingKeys?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Missing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">{analysisResults.emptyKeys?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Empty</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Global Translation Status</h3>
                <Button onClick={analyzeAllLanguages} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><RefreshCw className="mr-2 h-4 w-4" /> Analyze All</>
                  )}
                </Button>
              </div>

              {Object.keys(progress).length > 0 && (
                <div className="space-y-3">
                  {Object.entries(progress).map(([langCode, data]: [string, any]) => {
                    const lang = SUPPORTED_LANGUAGES[langCode as SupportedLanguage];
                    return (
                      <div key={langCode} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {lang.flag} {lang.nativeName}
                          </span>
                          <Badge variant={data.completionPercentage === 100 ? 'default' : 'secondary'}>
                            {data.completionPercentage}%
                          </Badge>
                        </div>
                        <Progress value={data.completionPercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-2">
                          {data.translatedKeys}/{data.totalKeys} keys translated
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};