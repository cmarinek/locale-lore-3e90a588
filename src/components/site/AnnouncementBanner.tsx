import React, { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AnnouncementBanner: React.FC = () => {
  const { activeAnnouncement } = useAnnouncements();
  const [dismissed, setDismissed] = useState(false);

  if (!activeAnnouncement || dismissed) return null;

  const getIcon = () => {
    switch (activeAnnouncement.type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 flex-shrink-0" />;
    }
  };

  const getDefaultColors = () => {
    switch (activeAnnouncement.type) {
      case 'warning':
        return { bg: 'bg-yellow-500', text: 'text-yellow-50' };
      case 'success':
        return { bg: 'bg-green-500', text: 'text-green-50' };
      case 'error':
        return { bg: 'bg-red-500', text: 'text-red-50' };
      default:
        return { bg: 'bg-blue-500', text: 'text-blue-50' };
    }
  };

  const colors = getDefaultColors();
  const bgStyle = activeAnnouncement.background_color 
    ? { backgroundColor: activeAnnouncement.background_color }
    : {};
  const textStyle = activeAnnouncement.text_color
    ? { color: activeAnnouncement.text_color }
    : {};

  return (
    <div
      className={`${!activeAnnouncement.background_color ? colors.bg : ''} ${!activeAnnouncement.text_color ? colors.text : ''} relative z-50`}
      style={{ ...bgStyle, ...textStyle }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getIcon()}
            <div className="flex-1 min-w-0">
              {activeAnnouncement.title && (
                <div className="font-semibold text-sm mb-1">
                  {activeAnnouncement.title}
                </div>
              )}
              <div className="text-sm opacity-90">
                {activeAnnouncement.message}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 rounded-full hover:bg-black/10 flex-shrink-0"
            style={textStyle}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
