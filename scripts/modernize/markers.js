#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📍 Modernizing map markers - CashApp style');

// Update AdvancedMap.tsx marker styling
const advancedMapPath = 'src/components/ui/AdvancedMap.tsx';
let mapContent = fs.readFileSync(advancedMapPath, 'utf8');

// Replace the createMarkerElement function with CashApp-style markers
const newCreateMarkerFunction = `  const createMarkerElement = useCallback((fact: any): HTMLElement => {
    const el = document.createElement('div');
    el.className = 'marker-container cursor-pointer';
    
    // Get category info
    const category = fact.categories?.slug || 'general';
    const isVerified = fact.status === 'verified';
    
    // CashApp-style color mapping
    const categoryColors: Record<string, string> = {
      'historical': '#dc2626', // Red like CVS
      'cultural': '#16a34a',   // Green like 7-Eleven
      'natural': '#2563eb',    // Blue
      'urban': '#7c3aed',      // Purple
      'folklore': '#ea580c',   // Orange
      'general': '#6b7280'     // Gray
    };
    
    const bgColor = categoryColors[category] || categoryColors.general;
    
    el.innerHTML = \`
      <div class="relative">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg transform transition-all duration-200 hover:scale-110" 
             style="background-color: \${bgColor}">
          <span class="font-bold">\${fact.categories?.icon || '📍'}</span>
        </div>
        \${isVerified ? 
          '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>' : 
          ''
        }
      </div>
    \`;
    
    return el;
  }, []);`;

// Replace the existing createMarkerElement function
mapContent = mapContent.replace(
  /const createMarkerElement = useCallback\([^}]+\}, \[\]\);/s,
  newCreateMarkerFunction
);

// Update cluster styling to match CashApp
const newClusterStyling = `        // Add cluster layer with CashApp-style circular markers
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'facts',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#16a34a',  // Green for small clusters
              10,
              '#2563eb',  // Blue for medium clusters
              30,
              '#dc2626'   // Red for large clusters
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              15,
              10,
              20,
              30,
              25
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add cluster count labels with clean typography
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'facts',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          },
          paint: {
            'text-color': '#ffffff'
          }
        });`;

mapContent = mapContent.replace(
  /\/\/ Add cluster layer[\s\S]*?paint: \{[\s\S]*?\}\s*\}\);/,
  newClusterStyling
);

fs.writeFileSync(advancedMapPath, mapContent);

console.log('✅ Marker modernization complete');