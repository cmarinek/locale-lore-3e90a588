import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Bell, Mail, MessageSquare, TestTube } from 'lucide-react';
import { AlertConfig, useSecurityAlerts } from '@/hooks/useSecurityAlerts';

export function AlertConfiguration() {
  const { config, saveConfig, sendTestAlert, isSending } = useSecurityAlerts();
  const [localConfig, setLocalConfig] = useState<AlertConfig>(config);

  const handleSave = () => {
    saveConfig(localConfig);
  };

  const handleTestAlert = async () => {
    await sendTestAlert();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </CardTitle>
          <CardDescription>
            Configure notification channels and alert thresholds for security vulnerabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Enable Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive real-time notifications when vulnerabilities are detected
              </p>
            </div>
            <Switch
              checked={localConfig.enabled}
              onCheckedChange={(checked) =>
                setLocalConfig({ ...localConfig, enabled: checked })
              }
            />
          </div>

          {/* Email Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Email Notifications</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="security@example.com"
                value={localConfig.email}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, email: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Security alerts will be sent to this email address
              </p>
            </div>
          </div>

          {/* Slack Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Slack Integration (Optional)</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slack">Slack Webhook URL</Label>
              <Input
                id="slack"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={localConfig.slackWebhook || ''}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, slackWebhook: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Get alerts in your Slack workspace.{' '}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Create webhook
                </a>
              </p>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-semibold">Alert Thresholds</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure minimum findings required to trigger alerts for each severity level
            </p>

            <div className="space-y-4">
              {Object.entries(localConfig.thresholds).map(([key, threshold]) => (
                <div
                  key={key}
                  className="p-4 border rounded-lg space-y-3 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          key === 'critical'
                            ? 'bg-destructive'
                            : key === 'high'
                            ? 'bg-orange-500'
                            : key === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <Label className="capitalize font-semibold">{key} Priority</Label>
                    </div>
                    <Switch
                      checked={threshold.enabled}
                      onCheckedChange={(checked) =>
                        setLocalConfig({
                          ...localConfig,
                          thresholds: {
                            ...localConfig.thresholds,
                            [key]: { ...threshold, enabled: checked },
                          },
                        })
                      }
                    />
                  </div>

                  {threshold.enabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Minimum findings</span>
                        <span className="font-semibold">{threshold.minFindings}</span>
                      </div>
                      <Slider
                        value={[threshold.minFindings]}
                        onValueChange={([value]) =>
                          setLocalConfig({
                            ...localConfig,
                            thresholds: {
                              ...localConfig.thresholds,
                              [key]: { ...threshold, minFindings: value },
                            },
                          })
                        }
                        min={1}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
            <Button
              variant="outline"
              onClick={handleTestAlert}
              disabled={!localConfig.email || isSending}
              className="gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
