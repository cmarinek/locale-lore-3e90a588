import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Globe, 
  Eye, 
  MapPin, 
  Palette, 
  Shield,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useProfile, UserSettings } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeProvider';
import { useLanguage } from '@/contexts/LanguageProvider';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
];


interface SettingsPanelProps {
  settings: UserSettings | null;
  onUpdate: (settings: Partial<UserSettings>) => void;
  loading: boolean;
}

export const SettingsPanel = ({ settings, onUpdate, loading }: SettingsPanelProps) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor },
  ];

  if (!settings || !localSettings) {
    return <div>Loading settings...</div>;
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how LocaleLore looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Button
                    key={theme.value}
                    variant={localSettings.theme === theme.value ? "default" : "outline"}
                    onClick={() => {
                      updateSetting('theme', theme.value);
                      setTheme(theme.value as 'light' | 'dark' | 'auto');
                    }}
                    className="flex flex-col items-center gap-2 h-auto py-3"
                    disabled={loading}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{theme.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={localSettings.language}
              onValueChange={(value) => {
                updateSetting('language', value);
                setLanguage(value as any);
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={localSettings.email_notifications}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              checked={localSettings.push_notifications}
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications while using the app
              </p>
            </div>
            <Switch
              checked={localSettings.in_app_notifications}
              onCheckedChange={(checked) => updateSetting('in_app_notifications', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and events
              </p>
            </div>
            <Switch
              checked={localSettings.marketing_emails}
              onCheckedChange={(checked) => updateSetting('marketing_emails', checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Visibility</Label>
            <Select
              value={localSettings.profile_visibility}
              onValueChange={(value) => updateSetting('profile_visibility', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public - Anyone can see your profile
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Friends - Only followers can see your profile
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Private - Only you can see your profile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Location Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow the app to access your location for discoveries
              </p>
            </div>
            <Switch
              checked={localSettings.location_sharing}
              onCheckedChange={(checked) => updateSetting('location_sharing', checked)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Discovery Radius ({localSettings.discovery_radius} km)</Label>
            <p className="text-sm text-muted-foreground">
              How far to search for nearby content
            </p>
            <Slider
              value={[localSettings.discovery_radius]}
              onValueChange={([value]) => updateSetting('discovery_radius', value)}
              max={50}
              min={1}
              step={1}
              className="w-full"
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activity Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the app by sharing usage data
              </p>
            </div>
            <Switch
              checked={localSettings.activity_tracking}
              onCheckedChange={(checked) => updateSetting('activity_tracking', checked)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Data Processing Consent</Label>
              <p className="text-sm text-muted-foreground">
                Allow processing of your data for personalization
              </p>
            </div>
            <Switch
              checked={localSettings.data_processing_consent}
              onCheckedChange={(checked) => updateSetting('data_processing_consent', checked)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};