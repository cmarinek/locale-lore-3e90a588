
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
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
  
  return rtlRender(
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

// Export testing utilities - use the render from renderWithProviders as default
export const render = renderWithProviders;
export { screen, fireEvent, waitFor };

// Export the mock auth context for tests that need it
export const mockAuth = mockAuthContext;
export { MockAuthProvider };
