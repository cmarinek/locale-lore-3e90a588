
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
export { screen, fireEvent, waitFor } from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export { customRender as render };
