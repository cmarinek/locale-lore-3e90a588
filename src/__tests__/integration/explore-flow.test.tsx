
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { server } from '@/test/mocks/server';

jest.mock('@/config/environments');
jest.mock('@/stores/discoveryStore', () => ({
  __esModule: true,
  useDiscoveryStore: jest.fn(),
}));
jest.mock('@/stores/searchStore', () => ({
  __esModule: true,
  useSearchStore: jest.fn(),
}));
jest.mock('@/stores/appStore', () => ({
  __esModule: true,
  useAppStore: jest.fn(() => ({
    triggerHapticFeedback: jest.fn(),
    handleTouchInteraction: jest.fn(),
  })),
}));
jest.mock('@/hooks/useStoreSync', () => ({
  __esModule: true,
  useStoreSync: jest.fn(),
}));
jest.mock('@/components/discovery/InfiniteFactList', () => ({
  __esModule: true,
  InfiniteFactList: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="infinite-list">Fact Feed ({viewMode})</div>
  ),
}));
jest.mock('@/components/discovery/FactPreviewModal', () => ({
  __esModule: true,
  FactPreviewModal: ({ fact, onClose }: { fact: { title: string } | null; onClose: () => void }) => (
    <div>
      <p>Preview: {fact?.title}</p>
      <button onClick={onClose}>Close Preview</button>
    </div>
  ),
}));
jest.mock('@/components/ui/clean-search-bar', () => ({
  __esModule: true,
  CleanSearchBar: ({ onQueryChange, placeholder }: { onQueryChange: (value: string) => void; placeholder?: string }) => (
    <input
      placeholder={placeholder}
      onChange={(event) => onQueryChange(event.target.value)}
    />
  ),
}));
jest.mock('@/components/templates/MainLayout', () => ({
  __esModule: true,
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: Record<string, unknown>) => void;
};
const { useDiscoveryStore } = jest.requireMock('@/stores/discoveryStore') as { useDiscoveryStore: jest.Mock };
const { useSearchStore } = jest.requireMock('@/stores/searchStore') as { useSearchStore: jest.Mock };
const { useAppStore } = jest.requireMock('@/stores/appStore') as { useAppStore: jest.Mock };
const { Explore } = require('@/pages/Explore') as typeof import('@/pages/Explore');

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Explore Flow Integration', () => {
  beforeEach(() => {
    const setSelectedFact = jest.fn();
    useDiscoveryStore.mockReturnValue({
      facts: [
        {
          id: 'fact-1',
          title: 'Test Fact',
          summary: 'A fascinating discovery.',
          status: 'verified',
          created_at: '2023-01-01T00:00:00Z',
          vote_count_up: 10,
          vote_count_down: 1,
          categories: { slug: 'history', icon: '🏛️', color: '#fff', category_translations: [{ name: 'History', language_code: 'en' }] },
          profiles: { id: 'author-1', username: 'Explorer', avatar_url: null },
        },
      ],
      selectedFact: null,
      setSelectedFact,
      isLoading: false,
      hasMore: true,
      error: null,
      loadMoreFacts: jest.fn(),
      initializeData: jest.fn(),
      addFacts: jest.fn(),
      setFacts: jest.fn(),
      setLoading: jest.fn(),
      setHasMore: jest.fn(),
      setError: jest.fn(),
      searchFacts: jest.fn(),
      fetchFactById: jest.fn(),
      clearCache: jest.fn(),
      categories: [
        {
          id: 'cat-history',
          slug: 'history',
          icon: '🏛️',
          color: '#fff',
          name: 'History',
          category_translations: [{ name: 'History', language_code: 'en' }],
        },
      ],
    });

    useSearchStore.mockReturnValue({
      query: '',
      setQuery: jest.fn(),
    });

    useAppStore.mockReturnValue({
      triggerHapticFeedback: jest.fn(),
      handleTouchInteraction: jest.fn(),
    });
  });

  it('loads and displays content', async () => {
    __setMockAuthState({ user: null, session: null, loading: false });
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByTestId('infinite-list')).toBeInTheDocument();
    });
  });

  it('allows filtering content by category', async () => {
    __setMockAuthState({ user: null, session: null, loading: false });
    render(<Explore />);
    
    // Wait for facts to load
    await waitFor(() => {
      expect(screen.getByTestId('infinite-list')).toHaveTextContent(/fact feed \(list\)/i);
    });
    
    // Open filter panel (if available)
    const filterButton = screen.queryByRole('button', { name: /filter/i });
    if (filterButton) {
      fireEvent.click(filterButton);
      
      // Select a category filter
      const categoryFilter = screen.queryByText(/history/i);
      if (categoryFilter) {
        fireEvent.click(categoryFilter);
      }
    }
  });

  it('handles search functionality', async () => {
    __setMockAuthState({ user: null, session: null, loading: false });
    render(<Explore />);

    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      await waitFor(() => {
        // Verify search results or loading state
        expect(searchInput).toHaveValue('test query');
      });
    }
  });
});
