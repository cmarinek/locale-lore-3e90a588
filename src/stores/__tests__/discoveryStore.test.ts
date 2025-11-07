jest.mock('@/integrations/supabase/client');
jest.mock('@/config/environments');

const { supabase } = require('@/integrations/supabase/client') as {
  supabase: jest.Mocked<typeof import('@/integrations/supabase/client')['supabase']>;
};

const { useDiscoveryStore } = require('../discoveryStore') as typeof import('../discoveryStore');

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

const baseFact = {
  id: 'fact-001',
  title: 'Ancient observatory',
  description: 'A glimpse into the night sky from centuries past.',
  status: 'verified',
  category_id: 'cat-history',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  vote_count_up: 12,
  vote_count_down: 1,
  profiles: { id: 'author-1', username: 'Historian' },
  categories: {
    slug: 'history',
    icon: '🏛️',
    color: '#fff',
    category_translations: [{ name: 'History', language_code: 'en' }],
  },
};

describe('discoveryStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSupabase.from.mockReset();

    useDiscoveryStore.setState({
      facts: [],
      selectedFact: null,
      isLoading: false,
      hasMore: true,
      error: null,
      currentPage: 0,
      factsPerPage: 50,
      categories: [],
      lastFetchTime: 0,
      factCache: new Map(),
    });
  });

  it('paginates results and updates cache when loading more facts', async () => {
    const factsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: [baseFact], error: null }),
    } as any;

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === 'facts') {
        return factsQuery;
      }
      return {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      } as any;
    });

    await useDiscoveryStore.getState().loadMoreFacts();

    const state = useDiscoveryStore.getState();
    expect(state.facts).toHaveLength(1);
    expect(state.currentPage).toBe(1);
    expect(state.hasMore).toBe(false);
    expect(state.factCache.get('fact-001')).toBeDefined();
  });

  it('returns cached facts without querying supabase again', async () => {
    useDiscoveryStore.getState().setFacts([baseFact as any]);

    mockedSupabase.from.mockReset();

    const result = await useDiscoveryStore.getState().fetchFactById('fact-001');

    expect(result?.id).toBe('fact-001');
    expect(mockedSupabase.from).not.toHaveBeenCalled();
  });
});
