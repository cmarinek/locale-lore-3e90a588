import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Star, Zap } from 'lucide-react';

interface PointsNotification {
  id: string;
  points: number;
  action: string;
  color?: string;
}

interface PointsAnimationProps {
  notifications: PointsNotification[];
  onComplete?: (id: string) => void;
}

export const PointsAnimation: React.FC<PointsAnimationProps> = ({
  notifications,
  onComplete
}) => {
  const getIcon = (action: string) => {
    switch (action) {
      case 'discovery':
        return <Star className="h-4 w-4" />;
      case 'verification':
        return <Zap className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getColor = (action: string) => {
    switch (action) {
      case 'discovery':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'verification':
        return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      case 'comment':
        return 'text-green-500 bg-green-500/20 border-green-500/30';
      default:
        return 'text-primary bg-primary/20 border-primary/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm
              ${getColor(notification.action)}
              shadow-lg
            `}
            initial={{ 
              opacity: 0, 
              scale: 0.5, 
              x: 100,
              y: 20 * index
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.5, 
              x: 100,
              y: -50
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.5
            }}
            onAnimationComplete={() => {
              setTimeout(() => {
                onComplete?.(notification.id);
              }, 2000);
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              {getIcon(notification.action)}
            </motion.div>
            <span className="font-bold">
              +{notification.points} XP
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Custom hook for managing points notifications
export const usePointsNotifications = () => {
  const [notifications, setNotifications] = useState<PointsNotification[]>([]);

  const addNotification = (points: number, action: string, color?: string) => {
    const id = Date.now().toString();
    const notification: PointsNotification = {
      id,
      points,
      action,
      color
    };
    
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification
  };
};