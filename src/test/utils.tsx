
import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { AuthContext } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// Re-export testing utilities
export { screen, fireEvent, waitFor } from '@testing-library/react';

interface MockAuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const mockAuthContext: MockAuthContextValue = {
  user: null,
  loading: false,
  signOut: async () => {},
};

const MockAuthProvider: React.FC<{ children: React.ReactNode; value?: Partial<MockAuthContextValue> }> = ({ 
  children, 
  value = {} 
}) => (
  <AuthContext.Provider value={{ ...mockAuthContext, ...value }}>
    {children}
  </AuthContext.Provider>
);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<MockAuthContextValue>;
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
  const { authValue, ...renderOptions } = options;
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockAuthProvider value={authValue}>
      {children}
    </MockAuthProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export const mockAuth = mockAuthContext;
export { MockAuthProvider };
