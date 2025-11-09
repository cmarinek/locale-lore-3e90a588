import { useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';

export const useSavedFacts = () => {
  const { savedFacts, toggleSavedFact } = useUserStore();

  const toggleSave = useCallback((factId: string) => {
    // Optimistic update - instant UI feedback
    toggleSavedFact(factId);
  }, [toggleSavedFact]);

  return {
    savedFacts,
    toggleSave,
    isSaving: false,
  };
};
