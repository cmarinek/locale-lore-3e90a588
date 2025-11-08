import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

export interface AlertThreshold {
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  minFindings: number;
}

export interface AlertConfig {
  email: string;
  slackWebhook?: string;
  thresholds: Record<string, AlertThreshold>;
  enabled: boolean;
}

export interface AlertHistory {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  findingsCount: number;
  sentAt: string;
  status: 'sent' | 'failed';
}

const DEFAULT_CONFIG: AlertConfig = {
  email: '',
  slackWebhook: '',
  thresholds: {
    critical: { severity: 'critical', enabled: true, minFindings: 1 },
    high: { severity: 'high', enabled: true, minFindings: 2 },
    medium: { severity: 'medium', enabled: false, minFindings: 5 },
    low: { severity: 'low', enabled: false, minFindings: 10 },
  },
  enabled: true,
};

export const useSecurityAlerts = () => {
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_CONFIG);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Load config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('security-alert-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        logger.error('Failed to parse alert config', error as Error);
      }
    }

    const savedHistory = localStorage.getItem('security-alert-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        logger.error('Failed to parse alert history', error as Error);
      }
    }
  }, []);

  // Save config to localStorage
  const saveConfig = useCallback((newConfig: AlertConfig) => {
    setConfig(newConfig);
    localStorage.setItem('security-alert-config', JSON.stringify(newConfig));
    toast({
      title: 'Configuration Saved',
      description: 'Alert settings have been updated successfully.',
    });
  }, [toast]);

  // Send security alert
  const sendAlert = useCallback(async (
    severity: 'critical' | 'high' | 'medium' | 'low',
    findings: Array<{ id: string; category: string; details: string }>
  ) => {
    if (!config.enabled) {
      logger.info('Alerts disabled, skipping notification');
      return { success: false, reason: 'disabled' };
    }

    const threshold = config.thresholds[severity];
    if (!threshold.enabled || findings.length < threshold.minFindings) {
      logger.info('Alert threshold not met', { severity, findingsCount: findings.length, minRequired: threshold.minFindings });
      return { success: false, reason: 'threshold_not_met' };
    }

    if (!config.email) {
      toast({
        title: 'Email Required',
        description: 'Please configure an email address in alert settings.',
        variant: 'destructive',
      });
      return { success: false, reason: 'no_email' };
    }

    setIsSending(true);

    try {
      const alertData = {
        severity,
        title: `${findings.length} ${severity} security ${findings.length === 1 ? 'issue' : 'issues'} detected`,
        description: `GeoCache Lore security scan has detected ${findings.length} ${severity} priority vulnerabilities that require immediate attention.`,
        findings,
        timestamp: new Date().toISOString(),
        recipientEmail: config.email,
        slackWebhook: config.slackWebhook,
      };

      const { data, error } = await supabase.functions.invoke('send-security-alert', {
        body: alertData,
      });

      if (error) throw error;

      // Add to history
      const historyEntry: AlertHistory = {
        id: `alert-${Date.now()}`,
        severity,
        title: alertData.title,
        description: alertData.description,
        findingsCount: findings.length,
        sentAt: alertData.timestamp,
        status: 'sent',
      };

      const newHistory = [historyEntry, ...history].slice(0, 50); // Keep last 50
      setHistory(newHistory);
      localStorage.setItem('security-alert-history', JSON.stringify(newHistory));

      toast({
        title: 'Alert Sent',
        description: `Security alert sent successfully to ${config.email}${config.slackWebhook ? ' and Slack' : ''}.`,
      });

      logger.info('Security alert sent successfully', { severity, findingsCount: findings.length });

      return { success: true, data };
    } catch (error) {
      logger.error('Failed to send security alert', error as Error);
      
      // Add failed entry to history
      const historyEntry: AlertHistory = {
        id: `alert-${Date.now()}`,
        severity,
        title: `${findings.length} ${severity} security issues detected`,
        description: 'Failed to send alert notification',
        findingsCount: findings.length,
        sentAt: new Date().toISOString(),
        status: 'failed',
      };

      const newHistory = [historyEntry, ...history].slice(0, 50);
      setHistory(newHistory);
      localStorage.setItem('security-alert-history', JSON.stringify(newHistory));

      toast({
        title: 'Alert Failed',
        description: 'Failed to send security alert. Please check your configuration.',
        variant: 'destructive',
      });

      return { success: false, error };
    } finally {
      setIsSending(false);
    }
  }, [config, history, toast]);

  // Test alert
  const sendTestAlert = useCallback(async () => {
    const testFindings = [
      {
        id: 'test-1',
        category: 'Test Vulnerability',
        details: 'This is a test security alert to verify your notification settings.',
      },
    ];

    return sendAlert('medium', testFindings);
  }, [sendAlert]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('security-alert-history');
    toast({
      title: 'History Cleared',
      description: 'Alert history has been cleared.',
    });
  }, [toast]);

  return {
    config,
    saveConfig,
    sendAlert,
    sendTestAlert,
    history,
    clearHistory,
    isSending,
  };
};
