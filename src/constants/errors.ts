// Centralized error messages - Single Source of Truth

export const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'You must be logged in to perform this action',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'This email is already registered',
  
  // Network
  NETWORK_ERROR: 'Network error. Please check your connection.',
  REQUEST_TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  TITLE_TOO_LONG: 'Title must be less than 100 characters',
  DESCRIPTION_TOO_LONG: 'Description must be less than 2000 characters',
  
  // File Upload
  FILE_TOO_LARGE: 'File size exceeds 5MB limit',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Location
  LOCATION_REQUIRED: 'Please select a location on the map',
  GEOLOCATION_DENIED: 'Location access denied',
  GEOLOCATION_UNAVAILABLE: 'Location services unavailable',
  
  // Data
  DATA_NOT_FOUND: 'Data not found',
  LOAD_FAILED: 'Failed to load data. Please try again.',
  SAVE_FAILED: 'Failed to save. Please try again.',
  DELETE_FAILED: 'Failed to delete. Please try again.',
  
  // Permissions
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  ADMIN_ONLY: 'This action is only available to administrators',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred',
  TRY_AGAIN: 'Something went wrong. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  SIGNUP_SUCCESS: 'Account created successfully',
  
  // Data Operations
  SAVE_SUCCESS: 'Saved successfully',
  DELETE_SUCCESS: 'Deleted successfully',
  UPDATE_SUCCESS: 'Updated successfully',
  
  // Story Operations
  STORY_CREATED: 'Story created successfully',
  STORY_UPDATED: 'Story updated successfully',
  STORY_DELETED: 'Story deleted successfully',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // Settings
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;
