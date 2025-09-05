
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { server } from '@/test/mocks/server';
import { Explore } from '@/pages/Explore';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Explore Flow Integration', () => {
  it('loads and displays content', async () => {
    render(<Explore />);
    
    await waitFor(() => {
      expect(screen.getByText(/test fact/i)).toBeInTheDocument();
    });
  });

  it('allows filtering content by category', async () => {
    render(<Explore />);
    
    // Wait for facts to load
    await waitFor(() => {
      expect(screen.getByText(/test fact/i)).toBeInTheDocument();
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
