import { useUserStore } from '../userStore';

const defaultPreferences = {
  theme: 'system' as const,
  language: 'en',
  notifications: {
    email: true,
    push: true,
    inApp: true,
  },
  privacy: {
    profileVisibility: 'public' as const,
    locationSharing: false,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    fontSize: 'medium' as const,
  },
};

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      authError: null,
      profile: null,
      preferences: defaultPreferences,
      location: null,
      locationPermission: null,
      savedFacts: [],
      recentlyViewed: [],
    });
  });

  it('derives authentication state from the active session', () => {
    useUserStore.getState().setSession({
      user: { id: 'user-1' },
    } as any);

    const state = useUserStore.getState();
    expect(state.user?.id).toBe('user-1');
    expect(state.isAuthenticated).toBe(true);
  });

  it('toggles saved facts reliably', () => {
    const store = useUserStore.getState();

    store.toggleSavedFact('fact-101');
    expect(useUserStore.getState().savedFacts).toContain('fact-101');

    store.toggleSavedFact('fact-101');
    expect(useUserStore.getState().savedFacts).not.toContain('fact-101');
  });

  it('updates top-level preferences while leaving untouched sections intact', () => {
    useUserStore.getState().updatePreferences({ language: 'it' });

    const { preferences } = useUserStore.getState();
    expect(preferences.language).toBe('it');
    expect(preferences.notifications.email).toBe(true);
  });

  it('resets user state to defaults', () => {
    const store = useUserStore.getState();

    store.setUser({ id: 'user-2' } as any);
    store.toggleSavedFact('fact-11');
    store.addToRecentlyViewed('fact-11');

    store.resetUserState();

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.savedFacts).toHaveLength(0);
    expect(state.recentlyViewed).toHaveLength(0);
    expect(state.isAuthenticated).toBe(false);
  });
});
