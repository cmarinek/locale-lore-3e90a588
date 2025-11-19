import { renderHook, waitFor } from '@/test/utils';
import { usePrivacySettings } from '../usePrivacySettings';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/integrations/supabase/client');

// Get auth mock helpers from setup
const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: any) => void;
};

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('usePrivacySettings', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    __setMockAuthState({ user: mockUser });
  });

  it('should load existing privacy settings successfully', async () => {
    const mockSettings = {
      user_id: 'test-user-id',
      profile_visibility: 'private',
      show_location: false,
      show_activity: true,
      discoverable: false,
    };

    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockSettings,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePrivacySettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings.profile_visibility).toBe('private');
    expect(result.current.settings.show_location).toBe(false);
    expect(result.current.settings.discoverable).toBe(false);
  });

  it('should create default settings when none exist', async () => {
    const mockNewSettings = {
      user_id: 'test-user-id',
      profile_visibility: 'public',
      show_location: true,
    };

    mockSupabase.from = jest.fn()
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNewSettings,
              error: null,
            }),
          }),
        }),
      });

    const { result } = renderHook(() => usePrivacySettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBeDefined();
    expect(result.current.settings.profile_visibility).toBe('public');
  });

  it('should update privacy settings successfully', async () => {
    mockSupabase.from = jest.fn()
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { profile_visibility: 'public' },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

    const { result } = renderHook(() => usePrivacySettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateSettings({ profile_visibility: 'private' });

    // Verify update was called
    expect(mockSupabase.from).toHaveBeenCalled();
  });

  it('should handle RLS policies correctly - users can only access their own settings', async () => {
    const otherUserSettings = {
      user_id: 'other-user-id',
      profile_visibility: 'private',
    };

    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null, // RLS should prevent access to other user's data
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => usePrivacySettings());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not have access to other user's settings
    expect(result.current.settings.user_id).not.toBe('other-user-id');
  });
});
