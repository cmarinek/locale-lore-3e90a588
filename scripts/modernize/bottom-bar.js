#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📱 Modernizing bottom bar - CashApp style');

// Create modern bottom action bar component
const bottomBarPath = 'src/components/ui/modern-bottom-bar.tsx';
const bottomBarContent = `import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Share, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernBottomBarProps {
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryActions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  className?: string;
}

export const ModernBottomBar: React.FC<ModernBottomBarProps> = ({
  primaryAction = {
    label: 'Explore Stories',
    icon: <QrCode className="w-5 h-5" />,
    onClick: () => {}
  },
  secondaryActions = [
    {
      label: 'Share',
      icon: <Share className="w-4 h-4" />,
      onClick: () => {}
    },
    {
      label: 'Filter',
      icon: <Filter className="w-4 h-4" />,
      onClick: () => {}
    }
  ],
  className
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container px-4 py-4">
        {/* Primary Action Button */}
        <Button
          onClick={primaryAction.onClick}
          className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium text-base mb-3"
        >
          {primaryAction.icon && (
            <span className="mr-2">{primaryAction.icon}</span>
          )}
          {primaryAction.label}
        </Button>
        
        {/* Secondary Actions */}
        {secondaryActions.length > 0 && (
          <div className="flex justify-center space-x-8">
            {secondaryActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};`;

fs.writeFileSync(bottomBarPath, bottomBarContent);

// Update Map.tsx to include bottom bar
const mapPath = 'src/pages/Map.tsx';
let mapContent = fs.readFileSync(mapPath, 'utf8');

// Add import
if (!mapContent.includes('ModernBottomBar')) {
  mapContent = mapContent.replace(
    "import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';",
    "import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';\nimport { ModernBottomBar } from '@/components/ui/modern-bottom-bar';"
  );
  
  // Add bottom bar before closing MainLayout
  mapContent = mapContent.replace(
    '</MainLayout>',
    `        {/* Modern Bottom Bar */}
        <ModernBottomBar
          primaryAction={{
            label: 'Explore Stories',
            onClick: () => navigate('/hybrid')
          }}
          secondaryActions={[
            {
              label: 'Share',
              icon: <Share className="w-4 h-4" />,
              onClick: () => {
                if (navigator.share) {
                  navigator.share({
                    title: 'LocaleLore - Explore Stories',
                    url: window.location.href
                  });
                }
              }
            }
          ]}
        />
      </MainLayout>`
  );
  
  // Add Share import
  mapContent = mapContent.replace(
    "import { List, Navigation } from 'lucide-react';",
    "import { List, Navigation, Share } from 'lucide-react';"
  );
}

fs.writeFileSync(mapPath, mapContent);

// Update UI index
const uiIndexPath = 'src/components/ui/index.ts';
let uiIndexContent = fs.readFileSync(uiIndexPath, 'utf8');

if (!uiIndexContent.includes('modern-bottom-bar')) {
  uiIndexContent += "export { ModernBottomBar } from './modern-bottom-bar';\n";
  fs.writeFileSync(uiIndexPath, uiIndexContent);
}

console.log('✅ Bottom bar modernization complete');