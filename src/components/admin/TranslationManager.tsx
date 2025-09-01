
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/useTranslation';
import { SUPPORTED_LANGUAGES } from '@/utils/i18n';
import { Save, Upload, Download, Globe, AlertCircle } from 'lucide-react';

export const TranslationManager: React.FC = () => {
  const { t, language } = useTranslation('admin');
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  const namespaces = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors'];

  const handleTranslationChange = (lang: string, key: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value
      }
    }));
  };

  const exportTranslations = () => {
    const data = JSON.stringify(translations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${selectedNamespace}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
                <Button variant="outline" onClick={exportTranslations}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            {namespaces.map((namespace) => (
              <TabsContent key={namespace} value={namespace} className="space-y-6">
                {/* Language Progress */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                    <Card key={lang.code} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium text-sm">{lang.nativeName}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>85%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          12 missing
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Missing Translations Alert */}
                {missingKeys.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-900">Missing Translations</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            The following keys are missing translations in some languages:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {missingKeys.slice(0, 10).map((key) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}
                              </Badge>
                            ))}
                            {missingKeys.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{missingKeys.length - 10} more
                              </Badge>
                            )}
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
                      {/* Sample translation keys - in real implementation, these would be loaded dynamically */}
                      {['title', 'description', 'save', 'cancel', 'loading'].map((key) => (
                        <div key={key} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{key}</Badge>
                          </div>
                          
                          <div className="grid gap-4">
                            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                              <div key={lang.code} className="grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-2 flex items-center gap-2">
                                  <span className="text-lg">{lang.flag}</span>
                                  <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                                </div>
                                <div className="col-span-10">
                                  <Input
                                    placeholder={`${key} in ${lang.nativeName}`}
                                    value={translations[lang.code]?.[key] || ''}
                                    onChange={(e) => handleTranslationChange(lang.code, key, e.target.value)}
                                    className={lang.rtl ? 'text-right' : ''}
                                    dir={lang.rtl ? 'rtl' : 'ltr'}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
