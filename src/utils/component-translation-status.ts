/**
 * Component Translation Status Tracker
 * This file tracks which components have been translated and which still need work
 */

export interface ComponentTranslationStatus {
  name: string;
  path: string;
  translated: boolean;
  translationPercentage: number;
  notes?: string;
  lastUpdated?: string;
}

export const COMPONENT_TRANSLATION_STATUS: ComponentTranslationStatus[] = [
  // Layout & Navigation
  { name: 'MainLayout', path: 'src/components/templates/MainLayout.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Navigation', path: 'src/components/ui/navigation.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'BottomNavigation', path: 'src/components/ui/bottom-navigation.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'LanguageSelector', path: 'src/components/ui/language-selector.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },

  // Pages
  { name: 'Index', path: 'src/pages/Index.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Explore', path: 'src/pages/Explore.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Search', path: 'src/pages/Search.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Submit', path: 'src/pages/Submit.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Profile', path: 'src/pages/Profile.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'AuthMain', path: 'src/pages/AuthMain.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'Admin', path: 'src/pages/Admin.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'Billing', path: 'src/pages/Billing.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'Social', path: 'src/pages/Social.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'Stories', path: 'src/pages/Stories.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'Gamification', path: 'src/pages/Gamification.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Auth Components
  { name: 'AuthLayout', path: 'src/components/auth/AuthLayout.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'EmailPasswordForm', path: 'src/components/auth/EmailPasswordForm.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },
  { name: 'SocialAuth', path: 'src/components/auth/SocialAuth.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'MagicLinkForm', path: 'src/components/auth/MagicLinkForm.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'PasswordResetForm', path: 'src/components/auth/PasswordResetForm.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'TwoFactorSetup', path: 'src/components/auth/TwoFactorSetup.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Admin Components
  { name: 'AdminDashboard', path: 'src/components/admin/AdminDashboard.tsx', translated: true, translationPercentage: 90, lastUpdated: '2024-01-15', notes: 'Some nested components may need review' },
  { name: 'AnalyticsDashboard', path: 'src/components/admin/AnalyticsDashboard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'ContentModerationPanel', path: 'src/components/admin/ContentModerationPanel.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'UserManagementPanel', path: 'src/components/admin/UserManagementPanel.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'ReportsPanel', path: 'src/components/admin/ReportsPanel.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Discovery Components
  { name: 'SearchBar', path: 'src/components/discovery/SearchBar.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'FilterPanel', path: 'src/components/discovery/FilterPanel.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'FactCard', path: 'src/components/discovery/FactCard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'InfiniteFactList', path: 'src/components/discovery/InfiniteFactList.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Profile Components
  { name: 'ProfileEditor', path: 'src/components/profile/ProfileEditor.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'SettingsPanel', path: 'src/components/profile/SettingsPanel.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'StatisticsCard', path: 'src/components/profile/StatisticsCard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'AchievementShowcase', path: 'src/components/profile/AchievementShowcase.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Gamification Components
  { name: 'GamificationHeader', path: 'src/components/gamification/GamificationHeader.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'AchievementBadge', path: 'src/components/gamification/AchievementBadge.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'ChallengeCard', path: 'src/components/gamification/ChallengeCard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'LeaderboardCard', path: 'src/components/gamification/LeaderboardCard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Social Components
  { name: 'ActivityFeed', path: 'src/components/social/ActivityFeed.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'DirectMessaging', path: 'src/components/social/DirectMessaging.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'SocialActivityFeed', path: 'src/components/social/SocialActivityFeed.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'UserProfile', path: 'src/components/social/UserProfile.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Lore Components
  { name: 'LoreSubmissionWizard', path: 'src/components/lore/LoreSubmissionWizard.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },
  { name: 'PaywallModal', path: 'src/components/lore/PaywallModal.tsx', translated: false, translationPercentage: 0, notes: 'Needs translation review' },

  // Core Organisms
  { name: 'WelcomeHero', path: 'src/components/organisms/WelcomeHero.tsx', translated: true, translationPercentage: 100, lastUpdated: '2024-01-15' },

  // Test Components
  { name: 'TranslationTest', path: 'src/components/test/TranslationTest.tsx', translated: false, translationPercentage: 0, notes: 'Test component - may not need translation' },
];

export const getTranslationStats = () => {
  const total = COMPONENT_TRANSLATION_STATUS.length;
  const translated = COMPONENT_TRANSLATION_STATUS.filter(c => c.translated).length;
  const partiallyTranslated = COMPONENT_TRANSLATION_STATUS.filter(c => c.translationPercentage > 0 && c.translationPercentage < 100).length;
  const untranslated = COMPONENT_TRANSLATION_STATUS.filter(c => c.translationPercentage === 0).length;
  
  const overallPercentage = Math.round(
    COMPONENT_TRANSLATION_STATUS.reduce((sum, c) => sum + c.translationPercentage, 0) / total
  );

  return {
    total,
    translated,
    partiallyTranslated,
    untranslated,
    overallPercentage,
  };
};

export const getUntranslatedComponents = () => {
  return COMPONENT_TRANSLATION_STATUS.filter(c => c.translationPercentage < 100);
};

export const getComponentsByCategory = () => {
  const categories: Record<string, ComponentTranslationStatus[]> = {
    pages: [],
    auth: [],
    admin: [],
    discovery: [],
    profile: [],
    gamification: [],
    social: [],
    lore: [],
    layout: [],
    test: [],
  };

  COMPONENT_TRANSLATION_STATUS.forEach(component => {
    if (component.path.includes('/pages/')) {
      categories.pages.push(component);
    } else if (component.path.includes('/auth/')) {
      categories.auth.push(component);
    } else if (component.path.includes('/admin/')) {
      categories.admin.push(component);
    } else if (component.path.includes('/discovery/')) {
      categories.discovery.push(component);
    } else if (component.path.includes('/profile/')) {
      categories.profile.push(component);
    } else if (component.path.includes('/gamification/')) {
      categories.gamification.push(component);
    } else if (component.path.includes('/social/')) {
      categories.social.push(component);
    } else if (component.path.includes('/lore/')) {
      categories.lore.push(component);
    } else if (component.path.includes('/templates/') || component.path.includes('/ui/navigation')) {
      categories.layout.push(component);
    } else if (component.path.includes('/test/')) {
      categories.test.push(component);
    }
  });

  return categories;
};