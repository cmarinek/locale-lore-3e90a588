import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Shield, BarChart3, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analytics } from '@/utils/analytics';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      analytics.setConsent(savedPreferences.analytics);
      if (savedPreferences.analytics) {
        analytics.initialize();
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    analytics.setConsent(prefs.analytics);
    if (prefs.analytics) {
      analytics.initialize();
    }

    if ((window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
      });
    }
    
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptSelected = () => {
    savePreferences(preferences);
  };

  const rejectOptional = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-md mx-auto border-2 shadow-lg">
        <CardContent className="p-6">
          {!showSettings ? (
            // Simple consent banner
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold">We use cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    We use essential cookies for functionality and optional cookies to improve 
                    your experience and provide analytics.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={acceptAll} className="flex-1">
                  Accept All
                </Button>
                <Button onClick={rejectOptional} variant="outline" className="flex-1">
                  Essential Only
                </Button>
                <Button 
                  onClick={() => setShowSettings(true)} 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Read our{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for details.
              </p>
            </div>
          ) : (
            // Detailed settings
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cookie Settings
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Essential Cookies
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Required for login and core functionality
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics Cookies
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Help us improve the app with usage insights
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, analytics: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Label>Marketing Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Personalized content and advertising
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences({...preferences, marketing: checked})
                    }
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex gap-2">
                <Button onClick={acceptSelected} className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={acceptAll} variant="outline">
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};