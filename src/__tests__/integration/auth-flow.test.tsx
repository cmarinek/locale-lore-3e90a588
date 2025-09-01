
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { server } from '@/test/mocks/server';
import AuthMain from '@/pages/AuthMain';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Authentication Flow Integration', () => {
  it('allows user to sign up with email and password', async () => {
    render(<AuthMain />);
    
    // Switch to sign up mode
    const signUpTab = screen.getByText(/sign up/i);
    fireEvent.click(signUpTab);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Wait for success message or redirect
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid input', async () => {
    render(<AuthMain />);
    
    // Try to submit without filling fields
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });
});
