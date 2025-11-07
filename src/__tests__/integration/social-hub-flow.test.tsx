import { render, screen, fireEvent, waitFor } from '@/test/utils';
jest.mock('@/integrations/supabase/client');
jest.mock('@/config/environments');

const { FollowButton } = require('@/components/social/FollowButton') as typeof import('@/components/social/FollowButton');
const { DirectMessaging } = require('@/components/social/DirectMessaging') as typeof import('@/components/social/DirectMessaging');
const { supabase } = require('@/integrations/supabase/client') as typeof import('@/integrations/supabase/client');
const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: Record<string, unknown>) => void;
};

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

const createFollowQuery = () => {
  let deleteCalls = 0;
  const deleteBuilder = {
    eq: jest.fn().mockImplementation(() => {
      deleteCalls += 1;
      if (deleteCalls >= 2) {
        return Promise.resolve({ error: null });
      }
      return deleteBuilder;
    }),
  };

  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest
      .fn()
      .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } as any }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnValue(deleteBuilder),
  } as any;
};

const sampleThread = {
  thread_id: 'thread-1',
  participant_id: 'user-2',
  participant_username: 'Jane Explorer',
  participant_avatar_url: null,
  participant_bio: 'Historian',
  participant_followers: 42,
  participant_following: 7,
  participant_reputation: 88,
  participant_created_at: '2023-01-01T00:00:00Z',
  participant_updated_at: '2023-01-02T00:00:00Z',
  last_message_id: 'message-1',
  last_message_sender: 'user-2',
  last_message_content: 'Thanks for sharing that discovery!',
  last_message_type: 'text',
  last_message_at: '2023-01-03T00:00:00Z',
  unread_count: 1,
  updated_at: '2023-01-03T00:00:00Z',
};

const sampleMessage = {
  id: 'message-1',
  thread_id: 'thread-1',
  sender_id: 'user-2',
  recipient_id: 'user-1',
  content: 'Thanks for sharing that discovery!',
  message_type: 'text',
  created_at: '2023-01-03T00:00:00Z',
  read_at: null,
  sender: {
    id: 'user-2',
    username: 'Jane Explorer',
  },
  recipient: {
    id: 'user-1',
    username: 'Current User',
  },
};

describe('Social hub integration flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __setMockAuthState({
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
      loading: false,
    });
  });

  it('allows a signed-in user to follow and unfollow another profile', async () => {
    const followQuery = createFollowQuery();

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === 'user_follows') {
        return followQuery;
      }
      throw new Error(`Unexpected table access: ${table}`);
    });

    render(<FollowButton userId="user-2" />);

    await waitFor(() => {
      expect(followQuery.single).toHaveBeenCalled();
    });

    const followButton = await screen.findByRole('button', { name: /follow/i });
    expect(followButton).toBeEnabled();

    fireEvent.click(followButton);

    await waitFor(() => {
      expect(followQuery.insert).toHaveBeenCalledWith({
        follower_id: 'user-1',
        following_id: 'user-2',
      });
    });

    expect(followButton).toHaveTextContent(/unfollow/i);

    fireEvent.click(followButton);

    await waitFor(() => {
      expect(followQuery.delete).toHaveBeenCalled();
    });

    expect(followButton).toHaveTextContent(/follow/i);
  });

  it('loads message threads and displays conversation details', async () => {
    const directMessagesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [sampleMessage], error: null }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: sampleMessage, error: null }),
      }),
    } as any;

    const participantsQuery = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockImplementation(() => participantsQuery),
    } as any;

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === 'direct_messages') {
        return directMessagesQuery;
      }
      if (table === 'direct_message_participants') {
        return participantsQuery;
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        update: jest.fn().mockResolvedValue({ error: null }),
      } as any;
    });

    mockedSupabase.rpc.mockImplementation(async (fn) => {
      if (fn === 'get_direct_message_threads') {
        return { data: [sampleThread], error: null } as any;
      }
      if (fn === 'get_or_create_direct_message_thread') {
        return { data: 'thread-1', error: null } as any;
      }
      return { data: [], error: null } as any;
    });

    render(<DirectMessaging />);

    const threadButton = await screen.findByRole('button', { name: /jane explorer/i });
    expect(threadButton).toBeInTheDocument();

    fireEvent.click(threadButton);

    await waitFor(() => {
      expect(directMessagesQuery.order).toHaveBeenCalled();
    });

    const messages = await screen.findAllByText(/thanks for sharing that discovery/i);
    expect(messages.length).toBeGreaterThan(0);
    expect(screen.getByText(/reputation 88/i)).toBeInTheDocument();
  });
});
