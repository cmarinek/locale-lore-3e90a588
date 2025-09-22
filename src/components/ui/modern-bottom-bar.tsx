import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface ModernBottomBarProps {
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  className?: string;
}

export const ModernBottomBar: React.FC<ModernBottomBarProps> = ({
  primaryAction,
  secondaryActions = [],
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-lg border-t border-border/50",
      "safe-area-inset-bottom",
      className
    )}>
      <div className="container px-4 py-3 pb-safe-area-inset-bottom">
        {primaryAction && (
          <div className="mb-3">
            <Button
              onClick={primaryAction.onClick}
              className="w-full h-12 sm:h-14 rounded-full bg-primary text-primary-foreground font-medium text-sm sm:text-base"
              size="lg"
            >
              <span className="mr-2">{primaryAction.icon}</span>
              {primaryAction.label}
            </Button>
          </div>
        )}
        
        {secondaryActions.length > 0 && (
          <div className="flex justify-center gap-4 sm:gap-6">
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto p-2 min-w-[44px]",
                  "text-muted-foreground hover:text-foreground",
                  "touch-manipulation"
                )}
              >
                <span className="text-base sm:text-lg">{action.icon}</span>
                <span className="text-xs sm:text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};