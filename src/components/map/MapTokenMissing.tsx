import React from 'react';
import { MapboxSetupNotice } from '@/components/ui/MapboxSetupNotice';

export const MapTokenMissing: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[500px] w-full">
      <MapboxSetupNotice />
    </div>
  );
};
