import { useState, useEffect, useCallback } from 'react';

interface FilterState {
  [key: string]: any;
}

interface UseFilterPersistenceOptions {
  storageKey: string;
  defaultFilters?: FilterState;
  syncAcrossTabs?: boolean;
  debounceMs?: number;
}

export const useFilterPersistence = (options: UseFilterPersistenceOptions) => {
  const {
    storageKey,
    defaultFilters = {},
    syncAcrossTabs = true,
    debounceMs = 300
  } = options;

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFilters({ ...defaultFilters, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load persisted filters:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, defaultFilters]);

  // Save filters to localStorage with debouncing
  useEffect(() => {
    if (isLoading) return;

    const timeoutId = setTimeout(() => {
      try {
        const filtersToSave = { ...filters };
        // Remove default values to save space
        Object.keys(defaultFilters).forEach(key => {
          if (filtersToSave[key] === defaultFilters[key]) {
            delete filtersToSave[key];
          }
        });
        
        localStorage.setItem(storageKey, JSON.stringify(filtersToSave));
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, defaultFilters, storageKey, debounceMs, isLoading]);

  // Listen for storage changes across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setFilters({ ...defaultFilters, ...parsed });
        } catch (error) {
          console.error('Failed to sync filters from other tab:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey, defaultFilters, syncAcrossTabs]);

  // Update specific filter
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(current => ({
      ...current,
      ...newFilters
    }));
  }, []);

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    localStorage.removeItem(storageKey);
  }, [defaultFilters, storageKey]);

  // Reset specific filter to default
  const resetFilter = useCallback((key: string) => {
    setFilters(current => {
      const newFilters = { ...current };
      if (key in defaultFilters) {
        newFilters[key] = defaultFilters[key];
      } else {
        delete newFilters[key];
      }
      return newFilters;
    });
  }, [defaultFilters]);

  // Get filter value with fallback to default
  const getFilter = useCallback((key: string, fallback?: any) => {
    return filters[key] ?? defaultFilters[key] ?? fallback;
  }, [filters, defaultFilters]);

  // Check if filters have changed from defaults
  const hasChanges = useCallback(() => {
    return Object.keys({ ...defaultFilters, ...filters }).some(key => 
      filters[key] !== defaultFilters[key]
    );
  }, [filters, defaultFilters]);

  // Get active filter count (non-default values)
  const activeFilterCount = useCallback(() => {
    return Object.keys(filters).filter(key => 
      filters[key] !== defaultFilters[key] && 
      filters[key] !== undefined && 
      filters[key] !== null &&
      filters[key] !== ''
    ).length;
  }, [filters, defaultFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    resetFilter,
    getFilter,
    hasChanges,
    activeFilterCount,
    isLoading
  };
};

// Hook for specific filter types with validation
interface FilterConfig {
  type: 'string' | 'number' | 'boolean' | 'array' | 'date';
  validate?: (value: any) => boolean;
  transform?: (value: any) => any;
}

interface TypedFilterConfigs {
  [key: string]: FilterConfig;
}

export const useTypedFilterPersistence = <T extends FilterState>(
  options: UseFilterPersistenceOptions,
  configs: TypedFilterConfigs
) => {
  const baseHook = useFilterPersistence(options);

  // Typed update with validation
  const updateTypedFilter = useCallback((key: keyof T, value: any) => {
    const config = configs[key as string];
    if (config) {
      // Transform value if transformer provided
      const transformedValue = config.transform ? config.transform(value) : value;
      
      // Validate if validator provided
      if (config.validate && !config.validate(transformedValue)) {
        console.warn(`Invalid value for filter ${String(key)}:`, transformedValue);
        return;
      }
      
      baseHook.updateFilter(key as string, transformedValue);
    } else {
      baseHook.updateFilter(key as string, value);
    }
  }, [baseHook, configs]);

  return {
    ...baseHook,
    filters: baseHook.filters as T,
    updateFilter: updateTypedFilter,
    updateFilters: (newFilters: Partial<T>) => baseHook.updateFilters(newFilters)
  };
};