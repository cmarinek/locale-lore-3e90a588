import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Keyboard, Volume2, Eye, MousePointer, Accessibility } from 'lucide-react';

interface AccessibilityState {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
}

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const [settings, setSettings] = useState<AccessibilityState>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    keyboardNavigation: false,
    screenReader: false
  });

  const panelRef = useRef<HTMLDivElement>(null);

  // Detect user preferences
  useEffect(() => {
    const detectPreferences = () => {
      setSettings(prev => ({
        ...prev,
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: window.matchMedia('(min-resolution: 2dppx)').matches
      }));
    };

    detectPreferences();

    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', detectPreferences);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', detectPreferences);
      });
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-nav');
    } else {
      root.classList.remove('keyboard-nav');
    }
  }, [settings]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }

      // Tab trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus first element when panel opens
      setTimeout(() => {
        const firstButton = panelRef.current?.querySelector('button');
        firstButton?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleSetting = (key: keyof AccessibilityState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className={cn(
        "fixed right-4 top-4 bottom-4 w-80 bg-background border border-border rounded-lg shadow-lg overflow-y-auto",
        className
      )} ref={panelRef}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="accessibility-title" className="text-lg font-semibold flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close accessibility panel">
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Visual</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">High Contrast</span>
                </div>
                <Button
                  variant={settings.highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('highContrast')}
                  aria-pressed={settings.highContrast}
                >
                  {settings.highContrast ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">A</span>
                  <span className="text-sm">Large Text</span>
                </div>
                <Button
                  variant={settings.largeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('largeText')}
                  aria-pressed={settings.largeText}
                >
                  {settings.largeText ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  <span className="text-sm">Reduce Motion</span>
                </div>
                <Button
                  variant={settings.reduceMotion ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('reduceMotion')}
                  aria-pressed={settings.reduceMotion}
                >
                  {settings.reduceMotion ? 'On' : 'Off'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Navigation</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  <span className="text-sm">Keyboard Navigation</span>
                </div>
                <Button
                  variant={settings.keyboardNavigation ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('keyboardNavigation')}
                  aria-pressed={settings.keyboardNavigation}
                >
                  {settings.keyboardNavigation ? 'On' : 'Off'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">Screen Reader Mode</span>
                </div>
                <Button
                  variant={settings.screenReader ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSetting('screenReader')}
                  aria-pressed={settings.screenReader}
                >
                  {settings.screenReader ? 'On' : 'Off'}
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>Keyboard Shortcuts:</strong></p>
                <ul className="space-y-1 ml-2">
                  <li>• Tab - Navigate between elements</li>
                  <li>• Enter/Space - Activate buttons</li>
                  <li>• Escape - Close dialogs</li>
                  <li>• Arrow keys - Navigate map</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(settings).map(([key, value]) => 
                value && (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccessibilityTriggerProps {
  onClick: () => void;
  className?: string;
}

export const AccessibilityTrigger: React.FC<AccessibilityTriggerProps> = ({
  onClick,
  className
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className={cn(
        "fixed bottom-4 left-4 z-40 h-12 w-12 rounded-full bg-background/90 backdrop-blur-md border-border/50 hover:bg-primary/10",
        className
      )}
      aria-label="Open accessibility options"
      title="Accessibility Options"
    >
      <Accessibility className="h-5 w-5" />
    </Button>
  );
};