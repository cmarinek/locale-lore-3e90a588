import React, { useEffect } from 'react';
import { SessionManager } from '@/utils/security';
import { appInitializer } from '@/utils/app-initialization';

interface AppInitializationProps {
  children: React.ReactNode;
}

export const AppInitialization: React.FC<AppInitializationProps> = ({ children }) => {
  useEffect(() => {
    // Initialize session management
    const sessionManager = SessionManager.getInstance();
    const handleActivity = () => sessionManager.updateActivity();
    
    // Track user activity for session management
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Minimal cache clearing in development only when needed
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      // Only clear on hot reload, not on every mount
      import.meta.hot?.on('vite:beforeUpdate', () => {
        console.log('🔄 DEV: Hot reload detected');
      });
    }
  }, []);

  return <>{children}</>;
};