// Central component library index for easy imports
// Usage: import { AdminDashboard, AuthLayout, Button } from '@/components'

// Admin components
export * from './admin';

// Authentication components  
export * from './auth';

// AI-powered components
export * from './ai';

// Discovery components
export * from './discovery';

// Search components  
export * from './search';

// Gamification components
export * from './gamification';

// Lore submission components
export * from './lore';

// Social features (avoid FactCard conflict by importing specifically)
export { FollowButton } from './social/FollowButton';
export { SocialActivityFeed } from './social/SocialActivityFeed';
export { SocialSharing } from './social/SocialSharing';
export { UserProfile } from './social/UserProfile';
export { ActivityFeed } from './social/ActivityFeed';
// DirectMessaging temporarily disabled - missing database tables

// Real-time components
export * from './realtime';

// Verification components
export * from './verification';

// UI components (atoms)
export * from './ui';

// Profile components
export * from './profile';

// Offline components
export * from './offline';

// Showcase components
export * from './showcase';

// Provider components
export * from './providers';

// Atomic design system exports
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';