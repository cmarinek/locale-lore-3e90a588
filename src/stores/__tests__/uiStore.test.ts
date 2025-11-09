/**
 * Unit Tests for UI Store
 * Target: 95% coverage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '../uiStore';
import { renderHook, act } from '@testing-library/react';

describe('UI Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useUIStore.setState({
        activeModal: null,
        modalData: null,
        leftDrawerOpen: false,
        rightDrawerOpen: false,
        showMapLegend: true,
        showMapStats: true,
        showMapFilters: false,
        globalLoading: false,
        loadingMessage: null,
        lastToastId: null,
        isMobileMenuOpen: false,
        isSearchOverlayOpen: false,
        visiblePanels: new Set(),
      });
    });
  });

  describe('Modal State', () => {
    it('should open modal with data', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('test-modal', { id: 123 });
      });

      expect(result.current.activeModal).toBe('test-modal');
      expect(result.current.modalData).toEqual({ id: 123 });
    });

    it('should open modal without data', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('simple-modal');
      });

      expect(result.current.activeModal).toBe('simple-modal');
      expect(result.current.modalData).toBeUndefined();
    });

    it('should close modal and clear data', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('test-modal', { data: 'test' });
      });

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.activeModal).toBeNull();
      expect(result.current.modalData).toBeNull();
    });

    it('should handle multiple modal opens', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('modal-1', { data: 1 });
      });

      act(() => {
        result.current.openModal('modal-2', { data: 2 });
      });

      // Should replace previous modal
      expect(result.current.activeModal).toBe('modal-2');
      expect(result.current.modalData).toEqual({ data: 2 });
    });
  });

  describe('Drawer State', () => {
    it('should toggle left drawer', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.leftDrawerOpen).toBe(false);

      act(() => {
        result.current.toggleLeftDrawer();
      });

      expect(result.current.leftDrawerOpen).toBe(true);

      act(() => {
        result.current.toggleLeftDrawer();
      });

      expect(result.current.leftDrawerOpen).toBe(false);
    });

    it('should toggle right drawer', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.rightDrawerOpen).toBe(false);

      act(() => {
        result.current.toggleRightDrawer();
      });

      expect(result.current.rightDrawerOpen).toBe(true);
    });

    it('should set left drawer state directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLeftDrawerOpen(true);
      });

      expect(result.current.leftDrawerOpen).toBe(true);

      act(() => {
        result.current.setLeftDrawerOpen(false);
      });

      expect(result.current.leftDrawerOpen).toBe(false);
    });

    it('should set right drawer state directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setRightDrawerOpen(true);
      });

      expect(result.current.rightDrawerOpen).toBe(true);
    });

    it('should handle both drawers independently', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleLeftDrawer();
        result.current.toggleRightDrawer();
      });

      expect(result.current.leftDrawerOpen).toBe(true);
      expect(result.current.rightDrawerOpen).toBe(true);
    });
  });

  describe('Map UI State', () => {
    it('should toggle map legend', () => {
      const { result } = renderHook(() => useUIStore());

      // Initial state is true
      expect(result.current.showMapLegend).toBe(true);

      act(() => {
        result.current.toggleMapLegend();
      });

      expect(result.current.showMapLegend).toBe(false);

      act(() => {
        result.current.toggleMapLegend();
      });

      expect(result.current.showMapLegend).toBe(true);
    });

    it('should toggle map stats', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.showMapStats).toBe(true);

      act(() => {
        result.current.toggleMapStats();
      });

      expect(result.current.showMapStats).toBe(false);
    });

    it('should toggle map filters', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.showMapFilters).toBe(false);

      act(() => {
        result.current.toggleMapFilters();
      });

      expect(result.current.showMapFilters).toBe(true);
    });

    it('should handle multiple map UI toggles', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleMapLegend();
        result.current.toggleMapStats();
        result.current.toggleMapFilters();
      });

      expect(result.current.showMapLegend).toBe(false);
      expect(result.current.showMapStats).toBe(false);
      expect(result.current.showMapFilters).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('should set global loading with message', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setGlobalLoading(true, 'Loading data...');
      });

      expect(result.current.globalLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('Loading data...');
    });

    it('should set global loading without message', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setGlobalLoading(true);
      });

      expect(result.current.globalLoading).toBe(true);
      expect(result.current.loadingMessage).toBeNull();
    });

    it('should clear loading state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setGlobalLoading(true, 'Loading...');
      });

      act(() => {
        result.current.setGlobalLoading(false);
      });

      expect(result.current.globalLoading).toBe(false);
      expect(result.current.loadingMessage).toBeNull();
    });

    it('should handle loading state changes', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setGlobalLoading(true, 'Step 1...');
      });

      expect(result.current.loadingMessage).toBe('Step 1...');

      act(() => {
        result.current.setGlobalLoading(true, 'Step 2...');
      });

      expect(result.current.loadingMessage).toBe('Step 2...');
    });
  });

  describe('Toast State', () => {
    it('should set last toast ID', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLastToastId('toast-123');
      });

      expect(result.current.lastToastId).toBe('toast-123');
    });

    it('should update toast ID', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLastToastId('toast-1');
      });

      act(() => {
        result.current.setLastToastId('toast-2');
      });

      expect(result.current.lastToastId).toBe('toast-2');
    });
  });

  describe('Mobile Menu State', () => {
    it('should toggle mobile menu', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isMobileMenuOpen).toBe(false);

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(true);

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe('Search Overlay State', () => {
    it('should toggle search overlay', () => {
      const { result } = renderHook(() => useUIStore());

      expect(result.current.isSearchOverlayOpen).toBe(false);

      act(() => {
        result.current.toggleSearchOverlay();
      });

      expect(result.current.isSearchOverlayOpen).toBe(true);

      act(() => {
        result.current.toggleSearchOverlay();
      });

      expect(result.current.isSearchOverlayOpen).toBe(false);
    });
  });

  describe('Panel Visibility', () => {
    it('should show panel', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showPanel('sidebar');
      });

      expect(result.current.visiblePanels.has('sidebar')).toBe(true);
    });

    it('should hide panel', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showPanel('sidebar');
      });

      act(() => {
        result.current.hidePanel('sidebar');
      });

      expect(result.current.visiblePanels.has('sidebar')).toBe(false);
    });

    it('should toggle panel', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.togglePanel('panel-1');
      });

      expect(result.current.visiblePanels.has('panel-1')).toBe(true);

      act(() => {
        result.current.togglePanel('panel-1');
      });

      expect(result.current.visiblePanels.has('panel-1')).toBe(false);
    });

    it('should handle multiple panels', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showPanel('panel-1');
        result.current.showPanel('panel-2');
        result.current.showPanel('panel-3');
      });

      expect(result.current.visiblePanels.size).toBe(3);
      expect(result.current.visiblePanels.has('panel-1')).toBe(true);
      expect(result.current.visiblePanels.has('panel-2')).toBe(true);
      expect(result.current.visiblePanels.has('panel-3')).toBe(true);
    });

    it('should not duplicate panels', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.showPanel('panel-1');
        result.current.showPanel('panel-1');
      });

      expect(result.current.visiblePanels.size).toBe(1);
    });
  });

  describe('Store Persistence', () => {
    it('should persist map UI preferences', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleMapLegend();
        result.current.toggleMapStats();
        result.current.toggleMapFilters();
      });

      // These should be persisted based on partialize config
      expect(result.current.showMapLegend).toBe(false);
      expect(result.current.showMapStats).toBe(false);
      expect(result.current.showMapFilters).toBe(true);
    });

    it('should not persist transient state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openModal('test-modal');
        result.current.toggleLeftDrawer();
        result.current.setGlobalLoading(true);
      });

      // These should NOT be persisted (transient state)
      expect(result.current.activeModal).toBe('test-modal');
      expect(result.current.leftDrawerOpen).toBe(true);
      expect(result.current.globalLoading).toBe(true);
    });
  });
});
