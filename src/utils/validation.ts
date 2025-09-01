
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateFactTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (title.length < 5) {
    return { isValid: false, error: 'Title must be at least 5 characters long' };
  }
  
  if (title.length > 200) {
    return { isValid: false, error: 'Title cannot exceed 200 characters' };
  }
  
  return { isValid: true };
};
