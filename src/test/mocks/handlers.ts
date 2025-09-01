
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase API endpoints
  http.get('*/rest/v1/facts', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Fact',
        content: 'This is a test fact',
        category: 'test',
        verified: true,
        created_at: '2023-01-01T00:00:00Z',
        vote_count_up: 10,
        vote_count_down: 2,
      },
    ]);
  }),

  http.post('*/rest/v1/facts', () => {
    return HttpResponse.json({
      id: '2',
      title: 'New Test Fact',
      content: 'This is a new test fact',
      category: 'test',
      verified: false,
      created_at: '2023-01-01T00:00:00Z',
    });
  }),

  // Mock auth endpoints
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: { id: 'test-user', email: 'test@example.com' },
      session: { access_token: 'test-token' },
    });
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      user: { id: 'test-user', email: 'test@example.com' },
      session: { access_token: 'test-token' },
    });
  }),
];
