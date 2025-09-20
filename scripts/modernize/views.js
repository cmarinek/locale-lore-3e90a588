#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('👁️ Modernizing view controls - CashApp style');

// Create modern view toggle component
const viewTogglePath = 'src/components/ui/modern-view-toggle.tsx';
const viewToggleContent = `import React from 'react';
import { List, Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernViewToggleProps {
  activeView: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  className?: string;
}

export const ModernViewToggle: React.FC<ModernViewToggleProps> = ({
  activeView,
  onViewChange,
  className
}) => {
  return (
    <div className={cn(
      "inline-flex items-center rounded-xl bg-muted p-1",
      className
    )}>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
          activeView === 'list'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-4 w-4" />
        <span>List</span>
      </button>
      
      <button
        onClick={() => onViewChange('map')}
        className={cn(
          "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
          activeView === 'map'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <MapIcon className="h-4 w-4" />
        <span>Map</span>
      </button>
    </div>
  );
};`;

fs.writeFileSync(viewTogglePath, viewToggleContent);

// Update Hybrid.tsx to use modern view toggle
const hybridPath = 'src/pages/Hybrid.tsx';
let hybridContent = fs.readFileSync(hybridPath, 'utf8');

// Add import
if (!hybridContent.includes('ModernViewToggle')) {
  hybridContent = hybridContent.replace(
    "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-social';",
    "import { ModernViewToggle } from '@/components/ui/modern-view-toggle';"
  );
  
  // Replace tabs with modern toggle
  const tabsReplacement = `          {/* Modern View Toggle */}
          <div className="flex justify-center mb-4">
            <ModernViewToggle
              activeView={activeTab}
              onViewChange={setActiveTab}
            />
          </div>
          
          {/* Content based on active view */}
          {activeTab === 'list' && (`;
          
  hybridContent = hybridContent.replace(
    /<Tabs[^>]*>[\s\S]*?<TabsList[^>]*>[\s\S]*?<\/TabsList>/,
    tabsReplacement
  );
  
  // Close the conditional rendering
  hybridContent = hybridContent.replace(
    /<\/TabsContent>[\s\S]*?<\/Tabs>/,
    `          )}
          
          {activeTab === 'map' && (
            <div className="h-[calc(100vh-280px)]">
              <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                <OptimizedMap
                  isVisible={activeTab === 'map'}
                  onFactClick={handleMapFactClick}
                  initialCenter={mapCenter}
                />
              </Suspense>
            </div>
          )}`
  );
}

fs.writeFileSync(hybridPath, hybridContent);

// Update UI index
const uiIndexPath = 'src/components/ui/index.ts';
let uiIndexContent = fs.readFileSync(uiIndexPath, 'utf8');

if (!uiIndexContent.includes('modern-view-toggle')) {
  uiIndexContent += "export { ModernViewToggle } from './modern-view-toggle';\n";
  fs.writeFileSync(uiIndexPath, uiIndexContent);
}

// Remove complex filter sidebar components
const filterPanelPath = 'src/components/discovery/FilterPanel.tsx';
if (fs.existsSync(filterPanelPath)) {
  let filterContent = fs.readFileSync(filterPanelPath, 'utf8');
  
  // Simplify filter panel to be more minimal
  const simpleFilterContent = `import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-xl border-t p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Historical', 'Cultural', 'Natural', 'Urban'].map((category) => (
                <Button key={category} variant="outline" size="sm">
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button className="w-full" onClick={onClose}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};`;
  
  fs.writeFileSync(filterPanelPath, simpleFilterContent);
}

console.log('✅ View controls modernization complete');`