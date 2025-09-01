
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock auth context
const mockAuthContext = {
  user: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  resetPassword: jest.fn(),
  loading: false,
  profile: null,
  updateProfile: jest.fn(),
};

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
    options
  );
};

// Re-export testing utilities
export { screen, fireEvent, waitFor };
