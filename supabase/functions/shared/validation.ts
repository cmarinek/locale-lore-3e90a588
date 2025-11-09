// Shared validation schemas for edge functions
// SSOT for input validation across all edge functions

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Base validation functions
export function validateRequired(value: any, fieldName: string): string | null {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateString(value: any, fieldName: string, options?: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}): string | null {
  if (typeof value !== 'string') {
    return `${fieldName} must be a string`;
  }
  
  if (options?.minLength && value.length < options.minLength) {
    return `${fieldName} must be at least ${options.minLength} characters`;
  }
  
  if (options?.maxLength && value.length > options.maxLength) {
    return `${fieldName} must be at most ${options.maxLength} characters`;
  }
  
  if (options?.pattern && !options.pattern.test(value)) {
    return `${fieldName} format is invalid`;
  }
  
  return null;
}

export function validateNumber(value: any, fieldName: string, options?: {
  min?: number;
  max?: number;
  integer?: boolean;
}): string | null {
  const num = Number(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  
  if (options?.integer && !Number.isInteger(num)) {
    return `${fieldName} must be an integer`;
  }
  
  if (options?.min !== undefined && num < options.min) {
    return `${fieldName} must be at least ${options.min}`;
  }
  
  if (options?.max !== undefined && num > options.max) {
    return `${fieldName} must be at most ${options.max}`;
  }
  
  return null;
}

export function validateEnum(value: any, fieldName: string, allowedValues: string[]): string | null {
  if (!allowedValues.includes(value)) {
    return `${fieldName} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
}

export function validateObject(value: any, fieldName: string): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return `${fieldName} must be an object`;
  }
  return null;
}

export function validateArray(value: any, fieldName: string, options?: {
  minLength?: number;
  maxLength?: number;
}): string | null {
  if (!Array.isArray(value)) {
    return `${fieldName} must be an array`;
  }
  
  if (options?.minLength && value.length < options.minLength) {
    return `${fieldName} must contain at least ${options.minLength} items`;
  }
  
  if (options?.maxLength && value.length > options.maxLength) {
    return `${fieldName} must contain at most ${options.maxLength} items`;
  }
  
  return null;
}

// Analytics event validation
export function validateAnalyticsEvent(event: any): ValidationResult<any> {
  const errors: string[] = [];
  
  // Validate type
  const typeError = validateRequired(event.type, 'type') || 
    validateEnum(event.type, 'type', ['performance', 'engagement', 'content', 'geographic', 'ab_test', 'revenue', 'retention', 'error', 'analytics']);
  if (typeError) errors.push(typeError);
  
  // Validate action
  const actionError = validateRequired(event.action, 'action') || 
    validateString(event.action, 'action', { maxLength: 100 });
  if (actionError) errors.push(actionError);
  
  // Validate properties
  if (event.properties !== undefined) {
    const propertiesError = validateObject(event.properties, 'properties');
    if (propertiesError) errors.push(propertiesError);
  }
  
  // Validate session_id
  if (event.session_id !== undefined) {
    const sessionError = validateString(event.session_id, 'session_id', { maxLength: 255 });
    if (sessionError) errors.push(sessionError);
  }
  
  // Validate timestamp
  if (event.timestamp !== undefined) {
    const timestampError = validateString(event.timestamp, 'timestamp');
    if (timestampError) errors.push(timestampError);
  }
  
  // Validate URL
  if (event.url !== undefined) {
    const urlError = validateString(event.url, 'url', { maxLength: 2048 });
    if (urlError) errors.push(urlError);
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? event : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Performance metric validation
export function validatePerformanceMetric(data: any): ValidationResult<any> {
  const errors: string[] = [];
  
  // Validate name
  const nameError = validateRequired(data.name, 'name') || 
    validateString(data.name, 'name', { maxLength: 100 });
  if (nameError) errors.push(nameError);
  
  // Validate value
  const valueError = validateRequired(data.value, 'value') || 
    validateNumber(data.value, 'value', { min: 0 });
  if (valueError) errors.push(valueError);
  
  // Validate labels
  if (data.labels !== undefined) {
    const labelsError = validateObject(data.labels, 'labels');
    if (labelsError) errors.push(labelsError);
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Error log validation
export function validateErrorLog(data: any): ValidationResult<any> {
  const errors: string[] = [];
  
  // Validate message
  const messageError = validateRequired(data.message, 'message') || 
    validateString(data.message, 'message', { maxLength: 1000 });
  if (messageError) errors.push(messageError);
  
  // Validate stack
  if (data.stack !== undefined) {
    const stackError = validateString(data.stack, 'stack', { maxLength: 5000 });
    if (stackError) errors.push(stackError);
  }
  
  // Validate context
  if (data.context !== undefined) {
    const contextError = validateObject(data.context, 'context');
    if (contextError) errors.push(contextError);
  }
  
  // Validate URL
  if (data.url !== undefined) {
    const urlError = validateString(data.url, 'url', { maxLength: 2048 });
    if (urlError) errors.push(urlError);
  }
  
  return {
    success: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors: errors.length > 0 ? errors : undefined
  };
}
