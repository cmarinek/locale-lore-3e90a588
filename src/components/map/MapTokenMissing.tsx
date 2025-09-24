import React from 'react';
import { MapboxSetupNotice } from '@/components/ui/MapboxSetupNotice';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ExternalLink, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MapTokenMissing: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full">
      <MapboxSetupNotice />
    </div>
  );
};