import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Map as MapIcon, 
  List, 
  Filter, 
  Locate,
  Search,
  Layers
} from 'lucide-react';

interface FloatingAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
}

interface FloatingActionButtonProps {
  actions: FloatingAction[];
  className?: string;
  mainIcon?: React.ReactNode;
  mainLabel?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  className,
  mainIcon = <Plus className="w-5 h-5" />,
  mainLabel = "Actions"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col gap-3 mb-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
              >
                <Button
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className="h-12 px-4 glass border-0 shadow-lg backdrop-blur-sm min-w-[120px] justify-start"
                >
                  {action.icon}
                  <span className="ml-2 text-sm">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <Button
        size="lg"
        onClick={toggleOpen}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg glass border-0 backdrop-blur-sm",
          "hover:scale-105 active:scale-95 transition-transform",
          isOpen && "rotate-45"
        )}
      >
        {mainIcon}
        <span className="sr-only">{mainLabel}</span>
      </Button>
    </div>
  );
};