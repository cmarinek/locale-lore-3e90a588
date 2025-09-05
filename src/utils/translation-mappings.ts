/**
 * Translation mappings for common placeholders and UI text
 * This helps ensure consistent translations across the application
 */
export const COMMON_TRANSLATIONS = {
  // Form placeholders
  placeholders: {
    'Enter your email': 'auth.enterEmail',
    'Enter your password': 'auth.enterPassword', 
    'Confirm your password': 'auth.confirmPassword',
    'Enter your full name': 'auth.enterFullName',
    'Choose a username': 'auth.chooseUsername',
    'Search...': 'common.search',
    'Search facts...': 'lore.search.searchPlaceholder',
    'Filter by status': 'common.filterByStatus',
    'Add a comment...': 'lore.verification.addComment',
    'What\'s happening?': 'stories.whatsHappening',
    'Type a message...': 'social.typeMessage',
  },

  // Button texts
  buttons: {
    'Save': 'common.save',
    'Cancel': 'common.cancel', 
    'Delete': 'common.delete',
    'Edit': 'common.edit',
    'View': 'common.view',
    'Share': 'common.share',
    'Submit': 'common.submit',
    'Back': 'common.back',
    'Next': 'common.next',
    'Previous': 'common.previous',
    'Close': 'common.close',
    'Open': 'common.open',
    'Login': 'auth.login',
    'Sign Up': 'auth.signUp',
    'Sign In': 'auth.signIn',
  },

  // Status messages
  status: {
    'Loading...': 'common.loading',
    'Success': 'common.success',
    'Error': 'common.error',
    'Pending': 'common.pending',
    'Approved': 'common.approved',
    'Rejected': 'common.rejected',
    'Active': 'common.active',
    'Inactive': 'common.inactive',
  },

  // Navigation
  navigation: {
    'Home': 'navigation.home',
    'Explore': 'navigation.explore', 
    'Search': 'navigation.search',
    'Profile': 'navigation.profile',
    'Settings': 'navigation.settings',
    'Admin': 'navigation.admin',
  }
} as const;