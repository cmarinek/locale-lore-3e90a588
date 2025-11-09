import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslationDebug } from '@/contexts/TranslationDebugContext';
import { toast } from 'sonner';

export const TranslationDebugToggle: React.FC = () => {
  const { debugMode, toggleDebugMode, missingKeys } = useTranslationDebug();

  const handleToggle = () => {
    toggleDebugMode();
    toast.success(
      debugMode 
        ? 'Translation debug mode disabled' 
        : 'Translation debug mode enabled - missing translations will be highlighted'
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur border rounded-lg p-2 shadow-lg">
      <Button
        variant={debugMode ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        className="gap-2"
      >
        {debugMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        Translation Debug
      </Button>
      {debugMode && missingKeys.size > 0 && (
        <Badge variant="destructive" className="animate-pulse">
          {missingKeys.size} missing
        </Badge>
      )}
    </div>
  );
};
