#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Modernizing search - CashApp style');

// Create modern search bar component
const modernSearchPath = 'src/components/ui/modern-search-bar.tsx';
const modernSearchContent = `import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showLocationButton?: boolean;
}

export const ModernSearchBar: React.FC<ModernSearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  className,
  showLocationButton = true
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <div className="absolute left-3 z-10">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-border bg-background/50 py-3 pl-10 pr-16 text-sm backdrop-blur-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        
        {showLocationButton && (
          <button
            type="button"
            className="absolute right-3 flex items-center space-x-1 text-sm font-medium text-primary"
          >
            <MapPin className="h-4 w-4" />
            <span>Near me</span>
          </button>
        )}
      </div>
    </form>
  );
};`;

fs.writeFileSync(modernSearchPath, modernSearchContent);

// Update Hybrid.tsx to use modern search
const hybridPath = 'src/pages/Hybrid.tsx';
let hybridContent = fs.readFileSync(hybridPath, 'utf8');

// Add import for modern search bar
if (!hybridContent.includes('ModernSearchBar')) {
  hybridContent = hybridContent.replace(
    "import { CleanSearchBar } from '@/components/ui/clean-search-bar';",
    "import { ModernSearchBar } from '@/components/ui/modern-search-bar';"
  );
  
  // Replace CleanSearchBar usage
  hybridContent = hybridContent.replace(
    /<CleanSearchBar[^>]*>/g,
    '<ModernSearchBar'
  );
  
  hybridContent = hybridContent.replace(
    /onQueryChange=/g,
    'onSearch='
  );
}

fs.writeFileSync(hybridPath, hybridContent);

// Update UI index to export new component
const uiIndexPath = 'src/components/ui/index.ts';
let uiIndexContent = fs.readFileSync(uiIndexPath, 'utf8');

if (!uiIndexContent.includes('modern-search-bar')) {
  uiIndexContent += "export { ModernSearchBar } from './modern-search-bar';\n";
  fs.writeFileSync(uiIndexPath, uiIndexContent);
}

console.log('✅ Search modernization complete');