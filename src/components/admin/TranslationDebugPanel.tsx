import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useTranslationDebug } from '@/contexts/TranslationDebugContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Languages, 
  CheckCircle2, 
  AlertCircle, 
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const TranslationDebugPanel: React.FC = () => {
  const { i18n } = useTranslation();
  const { currentLanguage, setLanguage, supportedLanguages, isRTL } = useLanguage();
  const { debugMode, toggleDebugMode, missingKeys } = useTranslationDebug();
  const [isExpanded, setIsExpanded] = useState(false);

  const loadedNamespaces = i18n.options.ns as string[] || [];
  const loadedLanguages = Object.keys(i18n.store.data);
  
  const currentLangData = i18n.store.data[currentLanguage] || {};
  const totalKeys = Object.values(currentLangData).reduce(
    (acc, namespace: any) => acc + Object.keys(namespace).length,
    0
  );

  const handleLanguageSwitch = async (langCode: string) => {
    try {
      await setLanguage(langCode as any);
      toast.success(`Switched to ${supportedLanguages[langCode as keyof typeof supportedLanguages].name}`);
    } catch (error) {
      toast.error('Failed to switch language');
    }
  };

  const handleReloadTranslations = () => {
    i18n.reloadResources().then(() => {
      toast.success('Translation resources reloaded');
    });
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Translation Debug</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={debugMode ? "default" : "outline"}
                size="sm"
                onClick={toggleDebugMode}
              >
                {debugMode ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <CardDescription>
            Monitor translations and test language switching
          </CardDescription>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Current Language Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Language</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReloadTranslations}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reload
                </Button>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-2xl">
                  {supportedLanguages[currentLanguage].flag}
                </span>
                <div className="flex-1">
                  <div className="font-medium">
                    {supportedLanguages[currentLanguage].nativeName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {supportedLanguages[currentLanguage].name} ({currentLanguage})
                    {isRTL && <Badge variant="outline" className="ml-2">RTL</Badge>}
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>

            <Separator />

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalKeys}</div>
                <div className="text-xs text-muted-foreground">Total Keys</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{loadedNamespaces.length}</div>
                <div className="text-xs text-muted-foreground">Namespaces</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-destructive">{missingKeys.size}</div>
                <div className="text-xs text-muted-foreground">Missing</div>
              </div>
            </div>

            <Separator />

            {/* Loaded Namespaces */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Loaded Namespaces</div>
              <div className="flex flex-wrap gap-1">
                {loadedNamespaces.map((ns) => (
                  <Badge key={ns} variant="secondary" className="text-xs">
                    {ns}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Missing Keys */}
            {missingKeys.size > 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-medium">Missing Keys</span>
                    <Badge variant="destructive" className="ml-auto">
                      {missingKeys.size}
                    </Badge>
                  </div>
                  <ScrollArea className="h-32 rounded-md border bg-muted/50 p-2">
                    <div className="space-y-1">
                      {Array.from(missingKeys).map((key) => (
                        <div key={key} className="text-xs font-mono text-muted-foreground">
                          {key}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                <Separator />
              </>
            )}

            {/* Language Switcher */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Quick Language Switch</span>
              </div>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-2 gap-2 pr-3">
                  {Object.entries(supportedLanguages).map(([code, lang]) => (
                    <Button
                      key={code}
                      variant={currentLanguage === code ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLanguageSwitch(code)}
                      className="justify-start h-auto py-2"
                    >
                      <span className="text-lg mr-2">{lang.flag}</span>
                      <div className="text-left">
                        <div className="text-xs font-medium">{lang.nativeName}</div>
                        <div className="text-[10px] opacity-70">{code}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Loaded Languages */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Loaded Languages</div>
              <div className="flex flex-wrap gap-1">
                {loadedLanguages.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
