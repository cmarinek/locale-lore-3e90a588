import React from 'react';
import { useOffline } from '@/hooks/useOffline';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingActions } = useOffline();

  return (
    <AnimatePresence>
      {(!isOnline || pendingActions.length > 0) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Badge 
            variant={isOnline ? "secondary" : "destructive"}
            className="px-3 py-2 text-xs font-medium shadow-lg"
          >
            {!isOnline ? (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </>
            ) : pendingActions.length > 0 ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Syncing {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </>
            )}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
};