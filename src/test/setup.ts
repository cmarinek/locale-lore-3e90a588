
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { toHaveNoViolations } from 'jest-axe';
import fetch, { Headers, Request, Response } from 'cross-fetch';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'stream/web';

jest.mock('@/config/environments', () => ({
  __esModule: true,
  default: {
    DEV: false,
    PROD: true,
    MODE: 'test',
  },
  environments: {
    DEV: false,
    PROD: true,
    MODE: 'test',
  },
}));

// Mock web-vitals to avoid performance.getEntriesByType errors in JSDOM
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onFID: jest.fn(),
  onINP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}));

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  __esModule: true,
  useToast: jest.fn(() => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: [],
  })),
}));

// Mock TranslationDebugContext
jest.mock('@/contexts/TranslationDebugContext', () => ({
  __esModule: true,
  TranslationDebugProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useTranslationDebug: () => ({
    isDebugMode: false,
    setDebugMode: jest.fn(),
    missingKeys: [],
    addMissingKey: jest.fn(),
  }),
}));

// Mock performance API methods not available in JSDOM
if (typeof performance !== 'undefined') {
  if (!performance.getEntriesByType) {
    performance.getEntriesByType = jest.fn().mockReturnValue([]);
  }
  if (!performance.getEntriesByName) {
    performance.getEntriesByName = jest.fn().mockReturnValue([]);
  }
  if (!performance.mark) {
    performance.mark = jest.fn();
  }
  if (!performance.measure) {
    performance.measure = jest.fn();
  }
  if (!performance.clearMarks) {
    performance.clearMarks = jest.fn();
  }
  if (!performance.clearMeasures) {
    performance.clearMeasures = jest.fn();
  }
}

type MockAuthState = {
  user: { id: string; email: string } | null;
  session: unknown;
  loading: boolean;
  signOut: jest.Mock;
};

const defaultAuthState: MockAuthState = {
  user: {
    id: 'test-user',
    email: 'test@example.com',
  },
  session: null,
  loading: false,
  signOut: jest.fn(),
};

const authState: MockAuthState = { ...defaultAuthState };

const setMockAuthState = (nextState: Partial<MockAuthState>) => {
  Object.assign(authState, nextState);
};

const resetMockAuthState = () => {
  authState.user = defaultAuthState.user;
  authState.session = defaultAuthState.session;
  authState.loading = defaultAuthState.loading;
  authState.signOut = jest.fn();
};

jest.mock('@/contexts/AuthProvider', () => ({
  __esModule: true,
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useAuth: () => authState,
  useAuthSafe: () => authState,
  __setMockAuthState: setMockAuthState,
  __resetMockAuthState: resetMockAuthState,
}));

jest.mock('@/hooks/useAdmin', () => ({
  __esModule: true,
  useAdmin: jest.fn(() => ({ isAdmin: false, loading: false })),
}));

type MockLanguageState = {
  currentLanguage: string;
  supportedLanguages: Record<string, unknown>;
  isLoading: boolean;
  isRTL: boolean;
  setLanguage: jest.Mock<Promise<void>, [string]>;
};

const defaultLanguageState: MockLanguageState = {
  currentLanguage: 'en',
  supportedLanguages: {},
  isLoading: false,
  isRTL: false,
  setLanguage: jest.fn().mockResolvedValue(undefined),
};

const languageState: MockLanguageState = { ...defaultLanguageState };

const setMockLanguageState = (nextState: Partial<MockLanguageState>) => {
  Object.assign(languageState, nextState);
};

const resetMockLanguageState = () => {
  languageState.currentLanguage = defaultLanguageState.currentLanguage;
  languageState.supportedLanguages = defaultLanguageState.supportedLanguages;
  languageState.isLoading = defaultLanguageState.isLoading;
  languageState.isRTL = defaultLanguageState.isRTL;
  languageState.setLanguage = jest.fn().mockResolvedValue(undefined);
};

jest.mock('@/contexts/LanguageProvider', () => ({
  __esModule: true,
  LanguageProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useLanguage: () => languageState,
  __setMockLanguageState: setMockLanguageState,
  __resetMockLanguageState: resetMockLanguageState,
}));

jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

jest.mock('react-i18next', () => {
  const translationMap: Record<string, string> = {
    'auth:fullName': 'Full Name',
    'auth:enterFullName': 'Enter your full name',
    'auth:username': 'Username',
    'auth:chooseUsername': 'Choose a username',
    'auth:email': 'Email',
    'auth:enterEmail': 'Enter your email',
    'auth:signInWithEmail': 'Sign in with Email',
    'auth:signUpWithEmail': 'Create Account',
    'auth:confirmPassword': 'Confirm Password',
    'lore:title': 'Explore Local Lore',
    'lore:subtitle': 'Discover fascinating stories and legends from around the world',
    'lore:searchPlaceholder': 'Search for stories, places, or legends...'
  };

  return {
    __esModule: true,
    useTranslation: (namespace?: string) => ({
      t: (key: string, options?: { defaultValue?: string }) => {
        const namespacedKey = namespace ? `${namespace}:${key}` : key;
        const normalizedKey = key.includes(':') ? key : namespacedKey;
        return translationMap[normalizedKey] ?? translationMap[namespacedKey] ?? options?.defaultValue ?? key;
      },
      i18n: {
        changeLanguage: jest.fn().mockResolvedValue(undefined),
        language: 'en',
      },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
}

process.env.VITE_SUPABASE_URL ||= 'http://localhost';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||= 'test-key';

if (!globalThis.Headers) {
  globalThis.Headers = Headers as any;
}

if (!globalThis.Request) {
  globalThis.Request = Request as any;
}

if (!globalThis.Response) {
  globalThis.Response = Response as any;
}

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as any;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder as any;
}

if (!globalThis.TransformStream) {
  globalThis.TransformStream = TransformStream as any;
}

if (!globalThis.BroadcastChannel) {
  class SimpleBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage(): void {
      // no-op
    }

    close(): void {
      this.onmessage = null;
    }

    addEventListener(): void {
      // no-op
    }

    removeEventListener(): void {
      // no-op
    }
  }

  globalThis.BroadcastChannel = SimpleBroadcastChannel as any;
}

if (!globalThis.navigator) {
  globalThis.navigator = {} as any;
}

if (!globalThis.navigator.vibrate) {
  globalThis.navigator.vibrate = () => false;
}

// Lazy load server after fetch polyfills are registered
 
const { server } = require('./mocks/server');

// Extend Jest matchers with axe-core
expect.extend(toHaveNoViolations);

// Extend global expect type
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      animate,
      initial,
      exit,
      transition,
      whileHover,
      whileTap,
      variants,
      layout,
      layoutId,
      ...rest
    } = props;
    return rest;
  };

  const createElement = (tag: string) =>
    ({ children, ...props }: any) => React.createElement(tag, stripMotionProps(props), children);

  return {
    motion: {
      div: createElement('div'),
      button: createElement('button'),
      span: createElement('span'),
    },
    AnimatePresence: ({ children }: any) => children,
    useReducedMotion: () => true,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      mount: jest.fn(),
      unmount: jest.fn(),
    }),
    Variants: {} as any,
  };
});

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
  },
});

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { __resetMockAuthState } = require('@/contexts/AuthProvider') as {
  __resetMockAuthState: () => void;
};

const { __resetMockLanguageState } = require('@/contexts/LanguageProvider') as {
  __resetMockLanguageState: () => void;
};

afterEach(() => {
  __resetMockAuthState();
  __resetMockLanguageState();
});
