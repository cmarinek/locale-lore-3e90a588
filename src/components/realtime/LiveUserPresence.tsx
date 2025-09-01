import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';
import { Eye, Users } from 'lucide-react';

interface LiveUserPresenceProps {
  factId?: string;
  showAvatars?: boolean;
  maxVisible?: number;
  className?: string;
}

export const LiveUserPresence: React.FC<LiveUserPresenceProps> = ({
  factId,
  showAvatars = true,
  maxVisible = 5,
  className = ""
}) => {
  const { presences, getUsersInLocation, getTotalOnlineUsers } = useRealtimePresence();
  
  const usersInLocation = factId ? getUsersInLocation(factId) : [];
  const totalOnline = getTotalOnlineUsers();
  
  // Filter out current user and get online users
  const onlineUsers = usersInLocation.filter(user => user.status === 'online');
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, onlineUsers.length - maxVisible);

  if (!factId && totalOnline === 0) return null;
  if (factId && usersInLocation.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {factId ? (
        <>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span className="text-xs">{usersInLocation.length}</span>
          </div>
          
          {showAvatars && onlineUsers.length > 0 && (
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <AnimatePresence>
                  {visibleUsers.map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, scale: 0, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <Avatar className="w-6 h-6 border-2 border-background">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-[10px]">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Status indicator */}
                      <motion.div
                        className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-background ${
                          user.status === 'online' ? 'bg-green-500' :
                          user.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {hiddenCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="ml-1"
                >
                  <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                    +{hiddenCount}
                  </Badge>
                </motion.div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-3 h-3" />
          <span className="text-xs">{totalOnline} online</span>
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      )}
    </div>
  );
};