
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { server } from '@/test/mocks/server';

jest.mock('@/config/environments');
jest.mock('@/integrations/supabase/client');

const authActionMocks = {
  signInWithEmail: jest.fn().mockResolvedValue({ user: null, session: null }),
  signUpWithEmail: jest.fn().mockResolvedValue({ user: { id: 'user-2' }, session: null }),
};

jest.mock('@/hooks/useAuthActions', () => ({
  __esModule: true,
  useAuthActions: () => ({
    signInWithEmail: authActionMocks.signInWithEmail,
    signUpWithEmail: authActionMocks.signUpWithEmail,
    loading: false,
  }),
  __mocks: authActionMocks,
}));

const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: Record<string, unknown>) => void;
};
const { __mocks: useAuthActionMocks } = jest.requireMock('@/hooks/useAuthActions') as {
  __mocks: typeof authActionMocks;
};
const AuthMain = require('@/pages/AuthMain').default as typeof import('@/pages/AuthMain').default;

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Authentication Flow Integration', () => {
  it('allows user to sign up with email and password', async () => {
    window.history.pushState({}, '', '/auth?mode=signup');
    __setMockAuthState({ user: null, session: null, loading: false });
    useAuthActionMocks.signUpWithEmail.mockClear();
    render(<AuthMain />);

    // Fill out the form
    const emailInput = await screen.findByPlaceholderText(/enter your email/i);
    const fullNameInput = screen.getByPlaceholderText(/enter your full name/i);
    const usernameInput = screen.getByPlaceholderText(/choose a username/i);
    const passwordInput = screen.getByPlaceholderText(/create a password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

    fireEvent.change(fullNameInput, { target: { value: 'Test User' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create account/i });
    const form = submitButton.closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(useAuthActionMocks.signUpWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Password123',
        expect.objectContaining({ username: 'testuser', full_name: 'Test User' })
      );
    });
  });

  it('shows validation errors for invalid input', async () => {
    window.history.pushState({}, '', '/auth?mode=signin');
    __setMockAuthState({ user: null, session: null, loading: false });
    render(<AuthMain />);

    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const form = submitButton.closest('form');
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/invalidcredentials/i)).toBeInTheDocument();
    });
  });
});
