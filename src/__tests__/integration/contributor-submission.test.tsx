import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';

jest.mock('@/integrations/supabase/client');
jest.mock('@/config/environments');

const { __setMockAuthState } = require('@/contexts/AuthProvider') as {
  __setMockAuthState: (state: Record<string, unknown>) => void;
};

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
  toast: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('@uiw/react-md-editor', () => {
  const MockEditor = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => (
    <textarea
      data-testid="markdown-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
  (MockEditor as any).Markdown = ({ source }: { source?: string }) => <div>{source}</div>;
  return MockEditor;
});

jest.mock('@/components/lore/steps/StepLocation', () => ({
  StepLocation: ({ onChange }: { onChange: (value: any) => void }) => (
    <div>
      <p>Location Step</p>
      <button onClick={() => onChange({ location_name: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964 })}>
        Select Rome
      </button>
    </div>
  ),
}));

jest.mock('@/components/lore/steps/StepPreview', () => ({
  StepPreview: () => <div>Preview Step</div>,
}));

const { LoreSubmissionWizard } = require('@/components/lore/LoreSubmissionWizard') as typeof import('@/components/lore/LoreSubmissionWizard');
const { supabase } = require('@/integrations/supabase/client') as typeof import('@/integrations/supabase/client');

const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Contributor submission wizard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __setMockAuthState({
      user: {
        id: 'user-123',
        email: 'contributor@example.com',
      },
      loading: false,
    });

    const categoriesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'cat-history',
            slug: 'history',
            icon: '🏛️',
            color: '#fff',
            category_translations: [{ name: 'History', language_code: 'en' }],
          },
        ],
        error: null,
      }),
    } as any;

    const loreInsertBuilder = {
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'draft-001' }, error: null }),
    } as any;

    const loreUpdateBuilder = {
      eq: jest.fn().mockResolvedValue({ error: null }),
    } as any;

    const loreDeleteBuilder = {
      eq: jest.fn().mockResolvedValue({ error: null }),
    } as any;

    const loreSubmissionsQuery = {
      insert: jest.fn().mockReturnValue(loreInsertBuilder),
      update: jest.fn().mockReturnValue(loreUpdateBuilder),
      delete: jest.fn().mockReturnValue(loreDeleteBuilder),
    } as any;

    const factsQuery = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    } as any;

    mockedSupabase.from.mockImplementation((table: string) => {
      if (table === 'categories') {
        return categoriesQuery;
      }
      if (table === 'lore_submissions') {
        return loreSubmissionsQuery;
      }
      if (table === 'facts') {
        return factsQuery;
      }
      return {
        insert: jest.fn().mockResolvedValue({ error: null }),
      } as any;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('walks a contributor through the submission flow and saves progress', async () => {
    jest.useFakeTimers();

    render(<LoreSubmissionWizard isContributor />);

    const titleInput = await screen.findByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Hidden Tunnels of Rome' } });

    const historyButton = await screen.findByRole('button', { name: /history/i });
    fireEvent.click(historyButton);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(mockedSupabase.from).toHaveBeenCalledWith('lore_submissions');
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);

    const descriptionEditor = await screen.findByTestId('markdown-editor');
    fireEvent.change(descriptionEditor, { target: { value: 'A network of ancient pathways under the city.' } });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.click(screen.getByRole('button', { name: /select rome/i }));

    const toPreview = screen.getByRole('button', { name: /next/i });
    expect(toPreview).toBeEnabled();
    fireEvent.click(toPreview);

    expect(await screen.findByText(/preview step/i)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /submit lore/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedSupabase.from).toHaveBeenCalledWith('facts');
    });
  });
});
