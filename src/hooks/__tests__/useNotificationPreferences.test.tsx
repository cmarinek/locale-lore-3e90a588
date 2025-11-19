import { renderHook, waitFor } from '@/test/utils';
import { useNotificationPreferences } from '../useNotificationPreferences';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('@/integrations/supabase/client');
jest.mock('@/hooks/use-toast');

// Get auth mock helpers from setup
const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: any) => void;
};

const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('useNotificationPreferences', () => {
  const mockUser = { id: 'test-user-id', email: 'test@example.com' };
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    __setMockAuthState({ user: mockUser });
    mockUseToast.mockReturnValue({ toast: mockToast } as any);
  });

  it('should load existing preferences successfully', async () => {
    const mockPreferences = {
      user_id: 'test-user-id',
      email_notifications: true,
      push_notifications: false,
      marketing_emails: true,
    };

    mockSupabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: mockPreferences,
            error: null,
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useNotificationPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences.email_notifications).toBe(true);
    expect(result.current.preferences.push_notifications).toBe(false);
  });

  it('should create default preferences when none exist', async () => {
    const mockNewPreferences = {
      user_id: 'test-user-id',
      email_notifications: true,
      push_notifications: true,
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
              data: mockNewPreferences,
              error: null,
            }),
          }),
        }),
      });

    const { result } = renderHook(() => useNotificationPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toBeDefined();
  });

  it('should update preferences successfully', async () => {
    mockSupabase.from = jest.fn()
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { email_notifications: true },
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

    const { result } = renderHook(() => useNotificationPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updatePreferences({ email_notifications: false });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          description: 'Notification preferences updated',
        })
      );
    });
  });

  it('should handle update errors gracefully', async () => {
    mockSupabase.from = jest.fn()
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { email_notifications: true },
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
        }),
      });

    const { result } = renderHook(() => useNotificationPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updatePreferences({ email_notifications: false });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to update notification preferences',
          variant: 'destructive',
        })
      );
    });
  });
});
