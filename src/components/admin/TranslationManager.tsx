
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslationFiles } from '@/hooks/useTranslationFiles';
import { SUPPORTED_LANGUAGES } from '@/utils/i18n';
import { TranslationGenerator } from '@/utils/translation-generator';
import { Save, Upload, Download, Globe, AlertCircle, Wand2, RefreshCw } from 'lucide-react';

export const TranslationManager: React.FC = () => {
  const { t, language } = useTranslation('admin');
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const {
    translations,
    progress,
    loading,
    error,
    saveTranslation,
    bulkTranslate,
    exportTranslations: exportFile,
    reloadTranslations
  } = useTranslationFiles();

  const namespaces = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

  const getCurrentNamespaceProgress = () => {
    return progress.filter(p => p.namespace === selectedNamespace);
  };

  const handleTranslationChange = async (lang: string, key: string, value: string) => {
    await saveTranslation(lang, selectedNamespace, key, value);
  };

  const generateAllTranslations = async () => {
    setIsGenerating(true);
    try {
      const results = await TranslationGenerator.generateMissingTranslations('en');
      console.log('Generated translations:', results);
      
      // Generate download files
      await TranslationGenerator.generateTranslationFiles(results);
      
      // Reload to reflect changes
      await reloadTranslations();
    } catch (error) {
      console.error('Failed to generate translations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const bulkTranslateNamespace = async (language: string) => {
    const namespaceProgress = progress.find(p => 
      p.language === language && p.namespace === selectedNamespace
    );
    
    if (namespaceProgress && namespaceProgress.missing.length > 0) {
      await bulkTranslate(language, selectedNamespace, namespaceProgress.missing);
    }
  };

  const getTranslationKeys = () => {
    const englishTranslations = translations.en?.[selectedNamespace] || {};
    return Object.keys(englishTranslations);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Translation Management
          </CardTitle>
          <CardDescription>
            Manage translations for all supported languages. Add missing translations and export translation files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={selectedNamespace} onValueChange={setSelectedNamespace}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full grid-cols-7">
                {namespaces.map((ns) => (
                  <TabsTrigger key={ns} value={ns} className="capitalize">
                    {ns}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={reloadTranslations} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload
                </Button>
                <Button variant="outline" onClick={() => exportFile('en', selectedNamespace)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={generateAllTranslations} disabled={isGenerating}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate All'}
                </Button>
              </div>
            </div>

            {namespaces.map((namespace) => (
              <TabsContent key={namespace} value={namespace} className="space-y-6">
                {/* Language Progress */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                    const langProgress = progress.find(p => 
                      p.language === lang.code && p.namespace === namespace
                    );
                    return (
                      <Card key={lang.code} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium text-sm">{lang.nativeName}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{langProgress?.percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${langProgress?.percentage || 0}%` }} 
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {langProgress?.missing.length || 0} missing
                            </Badge>
                            {langProgress && langProgress.missing.length > 0 && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-2 text-xs"
                                onClick={() => bulkTranslateNamespace(lang.code)}
                                disabled={loading}
                              >
                                <Wand2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Missing Translations Alert */}
                {getCurrentNamespaceProgress().some(p => p.missing.length > 0) && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900">Missing Translations</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Some languages are missing translations for this namespace.
                          </p>
                          <div className="mt-3 space-y-2">
                            {getCurrentNamespaceProgress()
                              .filter(p => p.missing.length > 0)
                              .map((langProgress) => (
                                <div key={langProgress.language} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {SUPPORTED_LANGUAGES[langProgress.language as keyof typeof SUPPORTED_LANGUAGES]?.nativeName}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {langProgress.missing.length} missing
                                    </Badge>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => bulkTranslateNamespace(langProgress.language)}
                                    disabled={loading}
                                  >
                                    <Wand2 className="w-3 h-3 mr-1" />
                                    Auto-translate
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Translation Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{namespace} Translations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="text-muted-foreground">Loading translations...</div>
                        </div>
                      ) : (
                        getTranslationKeys().map((key) => (
                          <div key={key} className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{key}</Badge>
                            </div>
                            
                            <div className="grid gap-4">
                              {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                                const translationValue = translations[lang.code]?.[selectedNamespace]?.[key];
                                const currentValue = typeof translationValue === 'string' ? translationValue : '';
                                const isEnglish = lang.code === 'en';
                                return (
                                  <div key={lang.code} className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-2 flex items-center gap-2">
                                      <span className="text-lg">{lang.flag}</span>
                                      <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                                    </div>
                                    <div className="col-span-10">
                                      <Input
                                        placeholder={`${key} in ${lang.nativeName}`}
                                        value={currentValue}
                                        onChange={(e) => handleTranslationChange(lang.code, key, e.target.value)}
                                        className={lang.rtl ? 'text-right' : ''}
                                        dir={lang.rtl ? 'rtl' : 'ltr'}
                                        disabled={isEnglish}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
