import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutosaveOptions {
  key: string;
  debounceMs?: number;
  onSave?: (data: any) => Promise<void>;
  onLoad?: () => Promise<any>;
  autoSaveInterval?: number; // Auto save every X ms
}

export const useAutosave = <T>(
  data: T,
  options: UseAutosaveOptions
) => {
  const {
    key,
    debounceMs = 1000,
    onSave,
    onLoad,
    autoSaveInterval = 30000 // 30 seconds
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);

  // Save to localStorage and optionally to server
  const saveData = useCallback(async (dataToSave: T) => {
    setIsSaving(true);
    setError(null);

    try {
      // Save to localStorage
      localStorage.setItem(`autosave-${key}`, JSON.stringify({
        data: dataToSave,
        timestamp: Date.now()
      }));

      // Save to server if callback provided
      if (onSave) {
        await onSave(dataToSave);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setError(errorMessage);
      console.error('Autosave failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [key, onSave]);

  // Load saved data
  const loadSavedData = useCallback(async (): Promise<T | null> => {
    try {
      // Try to load from server first
      if (onLoad) {
        const serverData = await onLoad();
        if (serverData) {
          return serverData;
        }
      }

      // Fallback to localStorage
      const saved = localStorage.getItem(`autosave-${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data;
      }
    } catch (err) {
      console.error('Failed to load saved data:', err);
    }
    
    return null;
  }, [key, onLoad]);

  // Check if there's saved data that's newer than current
  const hasSavedData = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const saved = localStorage.getItem(`autosave-${key}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Consider data as available if it's less than 24 hours old
          const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
          resolve(isRecent);
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    });
  }, [key]);

  // Debounced save when data changes
  useEffect(() => {
    // Don't trigger on initial load
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }

    lastDataRef.current = data;
    setHasUnsavedChanges(true);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveData(data);
    }, debounceMs);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, debounceMs, saveData]);

  // Auto-save interval
  useEffect(() => {
    if (autoSaveInterval > 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        if (hasUnsavedChanges && !isSaving) {
          saveData(data);
        }
      }, autoSaveInterval);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [autoSaveInterval, hasUnsavedChanges, isSaving, data, saveData]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return saveData(data);
  }, [data, saveData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave-${key}`);
    setLastSaved(null);
    setHasUnsavedChanges(false);
  }, [key]);

  // Get save status text
  const getSaveStatus = useCallback(() => {
    if (isSaving) return 'Saving...';
    if (error) return `Save failed: ${error}`;
    if (hasUnsavedChanges) return 'Unsaved changes';
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return 'All changes saved';
  }, [isSaving, error, hasUnsavedChanges, lastSaved]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error,
    saveNow,
    loadSavedData,
    hasSavedData,
    clearSavedData,
    getSaveStatus
  };
};

// Hook for form-specific autosave with validation
interface FormAutosaveOptions extends UseAutosaveOptions {
  validate?: (data: any) => boolean | string;
  onValidationError?: (error: string) => void;
}

export const useFormAutosave = <T extends Record<string, any>>(
  formData: T,
  options: FormAutosaveOptions
) => {
  const { validate, onValidationError, ...autosaveOptions } = options;

  const baseAutosave = useAutosave(formData, {
    ...autosaveOptions,
    onSave: async (data) => {
      // Validate before saving
      if (validate) {
        const validationResult = validate(data);
        if (validationResult !== true) {
          const error = typeof validationResult === 'string' 
            ? validationResult 
            : 'Validation failed';
          onValidationError?.(error);
          throw new Error(error);
        }
      }
      
      // Call original onSave if provided
      if (options.onSave) {
        await options.onSave(data);
      }
    }
  });

  return baseAutosave;
};