import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not dismissed before
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const installed = localStorage.getItem('pwa-installed');
        
        if (!dismissed && !installed && !isStandalone) {
          setShowPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('pwa-installed', 'true');
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
      
      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or running as PWA
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <Card className="p-4 bg-card/95 backdrop-blur-sm border shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {isIOS ? (
                  <Smartphone className="w-6 h-6 text-primary" />
                ) : (
                  <Download className="w-6 h-6 text-primary" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">
                  Install LoreKeeper
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {isIOS 
                    ? 'Add to Home Screen for the best experience'
                    : 'Install our app for faster access and offline features'
                  }
                </p>

                {isIOS ? (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>1.</span>
                      <span>Tap the share button</span>
                      <div className="w-4 h-4 border border-muted-foreground rounded flex items-center justify-center">
                        <div className="w-2 h-2 border-t border-l border-muted-foreground transform rotate-45" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>2.</span>
                      <span>Select "Add to Home Screen"</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDismiss}
                    >
                      Later
                    </Button>
                  </div>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-accent rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Features highlight */}
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Monitor className="w-3 h-3" />
                  <span>Offline access</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Smartphone className="w-3 h-3" />
                  <span>Native experience</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};