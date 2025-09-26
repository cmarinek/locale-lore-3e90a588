import React, { useEffect, useRef } from 'react';
import { SessionManager } from '@/utils/security';
import { simplifiedInitializer } from '@/utils/simplified-initialization';

interface AppInitializationProps {
  children: React.ReactNode;
}

export const AppInitialization: React.FC<AppInitializationProps> = ({ children }) => {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Single initialization call
    simplifiedInitializer.initialize().catch(error => {
      console.error('App initialization failed:', error);
    });

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

  return <>{children}</>;
};