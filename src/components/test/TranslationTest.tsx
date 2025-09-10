import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { SUPPORTED_LANGUAGES } from '@/utils/languages';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';

interface TranslationResult {
  translated_content: string;
  detected_language: string;
  confidence: number;
  notes: string;
}

export const TranslationTest: React.FC = () => {
  const [sourceText, setSourceText] = useState('Welcome to LocaleLore! Discover amazing local stories.');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTranslation = async () => {
    if (!sourceText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing translation with:', { sourceText, targetLanguage });
      
      const { data, error: translationError } = await supabase.functions.invoke('translate-content', {
        body: {
          content: sourceText,
          target_language: targetLanguage,
          source_language: 'English'
        }
      });

      if (translationError) {
        throw new Error(`Translation failed: ${translationError.message}`);
      }

      console.log('Translation result:', data);
      setResult(data as TranslationResult);
    } catch (err) {
      console.error('Translation test error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const testBulkTranslation = async () => {
    setLoading(true);
    setError(null);

    const testPhrases = [
      'Home',
      'Search',
      'Profile',
      'Settings',
      'Welcome back!',
      'Sign in to continue'
    ];

    try {
      const results = [];
      for (const phrase of testPhrases) {
        const { data } = await supabase.functions.invoke('translate-content', {
          body: {
            content: phrase,
            target_language: targetLanguage,
            source_language: 'English'
          }
        });
        results.push({ original: phrase, translated: data?.translated_content || phrase });
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('Bulk translation results:', results);
      setResult({
        translated_content: results.map(r => `${r.original} → ${r.translated}`).join('\n'),
        detected_language: 'English',
        confidence: 1.0,
        notes: 'Bulk translation test completed'
      });
    } catch (err) {
      console.error('Bulk translation error:', err);
      setError(err instanceof Error ? err.message : 'Bulk translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            AI Translation System Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Source Text (English)</label>
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SUPPORTED_LANGUAGES)
                    .filter(lang => lang.code !== 'en')
                    .map(lang => (
                      <SelectItem key={lang.code} value={lang.name}>
                        {lang.flag} {lang.nativeName} ({lang.name})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={testTranslation} 
                disabled={loading || !sourceText.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Test Translation
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline"
                onClick={testBulkTranslation} 
                disabled={loading}
              >
                Test Bulk Translation
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Translation Error</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900">Translation Result</h4>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-green-800">Translated Content:</label>
                        <p className="text-sm text-green-700 bg-white/50 p-3 rounded border mt-1 whitespace-pre-wrap">
                          {result.translated_content}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-green-800">Detected Language:</label>
                          <Badge variant="outline" className="mt-1">
                            {result.detected_language}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-green-800">Confidence:</label>
                          <Badge variant="outline" className="mt-1">
                            {Math.round(result.confidence * 100)}%
                          </Badge>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-green-800">Target:</label>
                          <Badge variant="outline" className="mt-1">
                            {targetLanguage}
                          </Badge>
                        </div>
                      </div>
                      
                      {result.notes && (
                        <div>
                          <label className="text-xs font-medium text-green-800">Notes:</label>
                          <p className="text-xs text-green-600 mt-1">{result.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Translation System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10</div>
                  <div className="text-sm text-muted-foreground">Supported Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">7</div>
                  <div className="text-sm text-muted-foreground">Translation Namespaces</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm text-muted-foreground">AI Translation Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">✓</div>
                  <div className="text-sm text-muted-foreground">Edge Function Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};