import { jest } from '@jest/globals';

const chainable = () => ({
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn().mockReturnValue(chainable()),
  limit: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
});

export const supabase = {
  from: jest.fn(() => chainable()),
  rpc: jest.fn(),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({}),
  })),
  removeChannel: jest.fn(),
  auth: {
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'user-1' }, session: { access_token: 'token' } }, error: null })
    ),
    signUp: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'user-2' }, session: null }, error: null })
    ),
    signInWithOtp: jest.fn(() =>
      Promise.resolve({ data: { user: null, session: null }, error: null })
    ),
    signInWithOAuth: jest.fn(() =>
      Promise.resolve({ data: { user: null, session: null }, error: null })
    ),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
    updateUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null })),
  },
};

export default supabase;
