import React, { useState } from 'react';
import { useTranslationFiles } from '@/hooks/useTranslationFiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Upload, Sparkles, Save, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const TranslationManagementTools: React.FC = () => {
  const { translations, progress, loading, saveTranslation, bulkTranslate, exportTranslations, reloadTranslations } = useTranslationFiles();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('es');
  const [selectedNamespace, setSelectedNamespace] = useState<string>('common');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const namespaces = ['common', 'navigation', 'auth', 'lore', 'profile', 'admin', 'errors', 'legal'];

  const currentProgress = progress.find(
    p => p.language === selectedLanguage && p.namespace === selectedNamespace
  );

  const handleSave = async () => {
    if (!editingKey) return;
    
    try {
      await saveTranslation(selectedLanguage, selectedNamespace, editingKey, editValue);
      toast.success('Translation saved successfully');
      setEditingKey(null);
      setEditValue('');
    } catch (error) {
      toast.error('Failed to save translation');
    }
  };

  const handleBulkTranslate = async () => {
    if (!currentProgress || currentProgress.missing.length === 0) {
      toast.info('No missing keys to translate');
      return;
    }

    setIsTranslating(true);
    try {
      await bulkTranslate(selectedLanguage, selectedNamespace, currentProgress.missing.slice(0, 20));
      toast.success(`Translated ${Math.min(20, currentProgress.missing.length)} keys`);
      await reloadTranslations();
    } catch (error) {
      toast.error('Bulk translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExport = () => {
    exportTranslations(selectedLanguage, selectedNamespace);
    toast.success('Translation file exported');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Save all imported keys
        for (const [key, value] of Object.entries(parsed)) {
          if (typeof value === 'string') {
            await saveTranslation(selectedLanguage, selectedNamespace, key, value);
          }
        }
        
        toast.success('Translation file imported successfully');
        await reloadTranslations();
      } catch (error) {
        toast.error('Failed to import translation file');
      }
    };
    reader.readAsText(file);
  };

  const currentTranslations = translations[selectedLanguage]?.[selectedNamespace] || {};
  const englishTranslations = translations.en?.[selectedNamespace] || {};

  // Get all keys (both from English and current language)
  const allKeys = new Set([
    ...Object.keys(englishTranslations),
    ...Object.keys(currentTranslations)
  ]);

  const filteredKeys = Array.from(allKeys).filter(key => 
    key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Translation Management Tools</CardTitle>
          <CardDescription>
            Edit translations, use AI assistance, and manage translation files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language and Namespace Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => (
                    <SelectItem key={code} value={code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Namespace</Label>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {namespaces.map(ns => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Progress</Label>
              <div className="flex items-center gap-2 h-10">
                {currentProgress ? (
                  <>
                    <Badge variant={currentProgress.percentage === 100 ? "default" : "outline"}>
                      {currentProgress.percentage}%
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentProgress.translated}/{currentProgress.total} keys
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">No data</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleBulkTranslate}
              disabled={isTranslating || !currentProgress || currentProgress.missing.length === 0}
              variant="default"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Translate Missing ({currentProgress?.missing.length || 0})
                </>
              )}
            </Button>

            <Button onClick={handleExport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          <Separator />

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Keys</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search translation keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Translation Editor */}
          <ScrollArea className="h-[500px] border rounded-md">
            <div className="p-4 space-y-4">
              {filteredKeys.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No translation keys found
                </p>
              ) : (
                filteredKeys.map(key => {
                  const englishValue = englishTranslations[key];
                  const translatedValue = currentTranslations[key];
                  const isMissing = !translatedValue;
                  const isEditing = editingKey === key;

                  return (
                    <Card key={key} className={isMissing ? 'border-orange-200 dark:border-orange-800' : ''}>
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <code className="text-sm font-mono text-muted-foreground flex-1">
                            {key}
                          </code>
                          {isMissing && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Missing
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">English (Source)</Label>
                          <p className="text-sm bg-muted p-2 rounded">
                            {typeof englishValue === 'string' ? englishValue : JSON.stringify(englishValue)}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            {SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name || selectedLanguage}
                          </Label>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={3}
                                className="w-full"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSave}>
                                  <Save className="mr-2 h-3 w-3" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingKey(null);
                                    setEditValue('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="text-sm bg-muted p-2 rounded cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => {
                                setEditingKey(key);
                                setEditValue(typeof translatedValue === 'string' ? translatedValue : '');
                              }}
                            >
                              {typeof translatedValue === 'string' ? translatedValue : (
                                <span className="text-muted-foreground italic">Click to add translation</span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
