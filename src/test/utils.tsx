
import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock auth context value
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

// Mock AuthContext component
const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const testQueryClient = createTestQueryClient();
  
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MockAuthProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </MockAuthProvider>
    </QueryClientProvider>,
    options
  );
};

// Export testing utilities
export { screen, fireEvent, waitFor };
export { render };
