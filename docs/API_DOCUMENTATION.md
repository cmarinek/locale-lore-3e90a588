# API Documentation

## Overview

This document provides comprehensive API documentation for the application's edge functions and client-side API integrations.

---

## Edge Functions

### Analytics & Metrics

#### `analytics-ingestion`

**Purpose**: Ingest and process analytics events in batches

**Endpoint**: `https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/analytics-ingestion`

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```typescript
{
  events: Array<{
    type: 'engagement' | 'content_performance' | 'geographic' | 'ab_test' | 'revenue' | 'retention';
    action: string;              // max 100 chars
    properties: Record<string, any>;
    timestamp: string;           // ISO 8601
    session_id?: string;         // max 255 chars
    user_id?: string;
    url?: string;                // max 2048 chars
  }>;  // min: 1, max: 100 events
  sessionId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  processed: number;
}
```

**Error Response**:
```typescript
{
  error: string;
  details?: string[];
}
```

**Validation Rules**:
- Events array: 1-100 items
- Event type: Must be valid enum value
- Action: Required, max 100 characters
- URL: Max 2048 characters
- Properties: Must be valid JSON object

**Status Codes**:
- `200`: Success
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

**Example Usage**:
```typescript
const response = await supabase.functions.invoke('analytics-ingestion', {
  body: {
    events: [{
      type: 'engagement',
      action: 'page_view',
      properties: { page: '/dashboard' },
      timestamp: new Date().toISOString(),
      session_id: 'abc123',
      url: 'https://example.com/dashboard'
    }],
    sessionId: 'abc123'
  }
});
```

---

#### `collect-metrics`

**Purpose**: Collect performance metrics, error logs, and analytics events

**Endpoint**: `https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/collect-metrics`

**Authentication**: Required (JWT Bearer token)

**Request Body**:
```typescript
{
  type: 'performance' | 'error' | 'analytics';
  data: PerformanceMetric | ErrorLog | AnalyticsEvent;
}
```

**Performance Metric Data**:
```typescript
{
  name: string;        // required, max 100 chars
  value: number;       // required, >= 0
  labels?: Record<string, any>;
}
```

**Error Log Data**:
```typescript
{
  message: string;     // required, max 1000 chars
  stack?: string;      // max 5000 chars
  context?: Record<string, any>;
  url?: string;        // max 2048 chars
}
```

**Response**:
```typescript
{
  success: boolean;
}
```

**Error Response**:
```typescript
{
  error: string;
  details?: string[];
}
```

**Validation Rules**:
- Type: Must be 'performance', 'error', or 'analytics'
- Performance value: Must be non-negative number
- String fields: Enforced max lengths
- Context/labels: Must be valid JSON objects

**Status Codes**:
- `200`: Success
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

**Example Usage**:
```typescript
// Performance metric
await supabase.functions.invoke('collect-metrics', {
  body: {
    type: 'performance',
    data: {
      name: 'page_load_time',
      value: 1234,
      labels: { page: '/dashboard' }
    }
  }
});

// Error log
await supabase.functions.invoke('collect-metrics', {
  body: {
    type: 'error',
    data: {
      message: 'Failed to fetch user data',
      stack: 'Error: ...',
      context: { userId: '123' },
      url: window.location.href
    }
  }
});
```

---

### AI Functions

#### `ai-categorize`

**Purpose**: Automatically categorize content using AI

**Endpoint**: `https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/ai-categorize`

**Authentication**: Required

**Request Body**:
```typescript
{
  content: string;
  contentType?: 'post' | 'location' | 'comment';
}
```

**Response**:
```typescript
{
  categories: string[];
  confidence: number;
}
```

---

#### `ai-recommendations`

**Purpose**: Generate personalized content recommendations

**Endpoint**: `https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/ai-recommendations`

**Authentication**: Required

**Request Body**:
```typescript
{
  userId: string;
  limit?: number;
  excludeIds?: string[];
}
```

**Response**:
```typescript
{
  recommendations: Array<{
    id: string;
    score: number;
    reason: string;
  }>;
}
```

---

### Admin Functions

#### `admin-subscription`

**Purpose**: Manage user subscriptions (admin only)

**Endpoint**: `https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/admin-subscription`

**Authentication**: Required (Admin role)

**Request Body**:
```typescript
{
  action: 'create' | 'update' | 'cancel';
  userId: string;
  planId?: string;
  metadata?: Record<string, any>;
}
```

**Response**:
```typescript
{
  success: boolean;
  subscription?: object;
}
```

---

## Client-Side API

### Supabase Client

**Import**:
```typescript
import { supabase } from '@/integrations/supabase/client';
```

**Authentication**:
```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
await supabase.auth.signOut();

// Get current session
const { data: { session } } = await supabase.auth.getSession();
```

**Database Queries**:
```typescript
// Select
const { data, error } = await supabase
  .from('locations')
  .select('*')
  .eq('user_id', userId);

// Insert
const { data, error } = await supabase
  .from('locations')
  .insert({ name: 'New Location', user_id: userId });

// Update
const { data, error } = await supabase
  .from('locations')
  .update({ name: 'Updated' })
  .eq('id', locationId);

// Delete
const { data, error } = await supabase
  .from('locations')
  .delete()
  .eq('id', locationId);
```

---

## Rate Limiting

### Current Implementation
- No rate limiting currently implemented
- Recommended: Add rate limiting to prevent abuse

### Planned Implementation
- Analytics ingestion: 100 events/minute per user
- Metrics collection: 60 requests/minute per user
- AI functions: 20 requests/minute per user

---

## Error Handling

### Standard Error Response Format
```typescript
{
  error: string;           // Human-readable error message
  details?: string[];      // Detailed validation errors
  code?: string;           // Error code for client handling
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

### Best Practices
1. Always check `error` field in responses
2. Display `details` array to users for validation errors
3. Implement retry logic for transient errors (500, 503)
4. Log errors to monitoring service
5. Never expose sensitive data in error messages

---

## Security

### Authentication
- All edge functions require JWT Bearer token by default
- Tokens obtained via Supabase Auth
- Token expiration: 1 hour (configurable)

### Authorization
- Role-Based Access Control (RBAC)
- Roles: admin, contributor, user
- Permissions checked at route and function level

### Input Validation
- All inputs validated against schemas
- String length limits enforced
- Type checking performed
- SQL injection prevention
- XSS protection

### Best Practices
1. Always validate user input
2. Use parameterized queries
3. Implement rate limiting
4. Log security events
5. Keep dependencies updated

---

## Performance

### Optimization Tips
1. **Batch Operations**: Use `analytics-ingestion` for multiple events
2. **Caching**: Implement client-side caching for frequent queries
3. **Pagination**: Always paginate large result sets
4. **Indexes**: Ensure database indexes on frequently queried columns
5. **Connection Pooling**: Supabase handles this automatically

### Monitoring
- Track response times via `collect-metrics`
- Monitor error rates
- Set up alerts for anomalies
- Review edge function logs regularly

---

## Migration Guide

### From v1 to v2 (Current)

**Breaking Changes**:
1. Analytics ingestion now requires array validation
2. Metrics collection enforces type validation
3. String length limits added

**Migration Steps**:
1. Update client code to validate inputs before sending
2. Handle new validation error responses
3. Update tests to reflect new validation rules

---

## Support

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)

### Monitoring
- [Edge Function Logs](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/functions)
- [Database Logs](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/logs)

### Issues
- Check console logs for client-side errors
- Review edge function logs for server-side errors
- Verify RLS policies if authorization fails
