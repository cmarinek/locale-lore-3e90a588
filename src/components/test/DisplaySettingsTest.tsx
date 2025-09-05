import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProfile } from '@/hooks/useProfile';
import { Monitor, Sun, Moon, Globe, Settings } from 'lucide-react';

export const DisplaySettingsTest: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const { currentLanguage, setLanguage, isRTL } = useLanguage();
  const { settings } = useProfile();

  const testThemes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  const testLanguages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'ar', label: 'العربية' },
    { value: 'ja', label: '日本語' },
  ];

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Settings Test
          </CardTitle>
          <CardDescription>
            Test theme switching, language changes, and visual preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Settings:</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Theme: {theme}</Badge>
              <Badge variant="outline">Actual: {actualTheme}</Badge>
              <Badge variant="outline">Language: {currentLanguage}</Badge>
              <Badge variant="outline">RTL: {isRTL ? 'Yes' : 'No'}</Badge>
              <Badge variant="outline">Saved Theme: {settings?.theme || 'None'}</Badge>
            </div>
          </div>

          {/* Theme Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Theme Controls:</h3>
            <div className="grid grid-cols-3 gap-3">
              {testThemes.map((testTheme) => {
                const Icon = testTheme.icon;
                return (
                  <Button
                    key={testTheme.value}
                    variant={theme === testTheme.value ? "default" : "outline"}
                    onClick={() => setTheme(testTheme.value as any)}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{testTheme.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Language Testing */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Language Controls:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {testLanguages.map((lang) => (
                <Button
                  key={lang.value}
                  variant={currentLanguage === lang.value ? "default" : "outline"}
                  onClick={() => setLanguage(lang.value as any)}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Globe className="h-3 w-3" />
                  {lang.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Visual Test Elements */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Visual Elements Test:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Sample Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This card demonstrates how content appears with different themes.
                  </p>
                  <div className="flex gap-2">
                    <Badge>Primary</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Background Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-primary/20 rounded"></div>
                    <div className="h-4 bg-secondary rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Debug Info */}
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify({
                theme,
                actualTheme,
                currentLanguage,
                isRTL,
                settings: settings ? {
                  theme: settings.theme,
                  language: settings.language,
                } : null,
                documentClasses: document.documentElement.className,
                documentDir: document.documentElement.getAttribute('dir'),
              }, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};