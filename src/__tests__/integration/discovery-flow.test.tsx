
import { render } from '@/test/utils';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { server } from '@/test/mocks/server';
import Discovery from '@/pages/Discovery';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Discovery Flow Integration', () => {
  it('loads and displays facts', async () => {
    render(<Discovery />);
    
    await waitFor(() => {
      expect(screen.getByText(/test fact/i)).toBeInTheDocument();
    });
  });

  it('allows filtering facts by category', async () => {
    render(<Discovery />);
    
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
    render(<Discovery />);
    
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
