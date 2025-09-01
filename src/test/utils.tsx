
import React, { ReactElement } from 'react';
import { 
  render, 
  RenderOptions, 
  screen, 
  fireEvent, 
  waitFor 
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { MobileProvider } from '@/components/providers/MobileProvider';

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Explicitly export the commonly used functions
export { screen, fireEvent, waitFor };

// Create a custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MobileProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </MobileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Override the default render with our custom render
export { customRender as render };
