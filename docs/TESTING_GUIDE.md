# Testing Guide

## Table of Contents
1. [Overview](#overview)
2. [Test Types](#test-types)
3. [Running Tests](#running-tests)
4. [Feature Verification Checklist](#feature-verification-checklist)
5. [Regression Testing](#regression-testing)
6. [Performance Benchmarks](#performance-benchmarks)
7. [Testing Best Practices](#testing-best-practices)

## Overview

This guide provides comprehensive testing procedures for the Locale Lore application. All features should pass these tests before being considered production-ready.

## Test Types

### Unit Tests
- **Location**: `src/**/__tests__/*.test.tsx`
- **Framework**: Jest + React Testing Library
- **Purpose**: Test individual components and functions in isolation
- **Run**: `npm run test:unit`

### Integration Tests
- **Location**: `src/__tests__/integration/*.test.tsx`
- **Framework**: Jest + React Testing Library + MSW
- **Purpose**: Test interactions between multiple components
- **Run**: `npm run test:integration`

### E2E Tests
- **Location**: `tests/e2e/*.spec.ts`
- **Framework**: Playwright
- **Purpose**: Test complete user workflows in real browser
- **Run**: `npm run test:e2e`

### Accessibility Tests
- **Framework**: axe-core + Playwright
- **Purpose**: Ensure WCAG 2.1 AA compliance
- **Run**: `npm run test:a11y`

### Performance Tests
- **Location**: `e2e/performance.spec.ts`
- **Purpose**: Measure Core Web Vitals and performance metrics
- **Run**: `npm run test:performance`

### Visual Regression Tests
- **Location**: `e2e/visual.spec.ts`
- **Purpose**: Detect unintended UI changes
- **Run**: `npm run test:visual`

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e          # E2E tests (requires dev server)
npm run test:a11y         # Accessibility tests
npm run test:performance  # Performance tests
npm run test:coverage     # Generate coverage report

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests matching pattern
npm test -- --grep "authentication"
```

## Feature Verification Checklist

### Authentication & User Management
- [ ] User can sign up with email and password
- [ ] User receives email verification
- [ ] User can sign in with valid credentials
- [ ] User cannot sign in with invalid credentials
- [ ] User can reset password via email
- [ ] User can update password
- [ ] User session persists across page reloads
- [ ] User can log out successfully
- [ ] Protected routes redirect to auth page when not logged in
- [ ] Authenticated users can access protected routes

### Role-Based Access Control
- [ ] Users are assigned default "user" role on signup
- [ ] Admins can access admin dashboard
- [ ] Non-admins are redirected from admin routes
- [ ] Contributors can create/edit content
- [ ] Regular users cannot access contributor features
- [ ] Role changes take effect immediately
- [ ] Role-based UI elements show/hide correctly

### Map & Geolocation
- [ ] Map loads and displays correctly
- [ ] User location is detected and displayed
- [ ] Markers appear on map for stories
- [ ] Clicking marker shows story popup
- [ ] Map supports zoom and pan interactions
- [ ] Marker clustering works for dense areas
- [ ] Map loads efficiently with many markers

### Story/Fact Management
- [ ] Users can create new stories
- [ ] Stories appear on map at correct location
- [ ] Users can edit their own stories
- [ ] Users cannot edit others' stories
- [ ] Users can delete their own stories
- [ ] Stories can be filtered by category
- [ ] Story images upload successfully
- [ ] Story verification workflow works

### Notification System
- [ ] Users receive in-app notifications
- [ ] Notification preferences can be updated
- [ ] Email notifications are sent (check logs)
- [ ] Push notifications work on PWA
- [ ] Users can mark notifications as read
- [ ] Notification badge shows unread count
- [ ] Real-time notifications appear instantly

### Privacy & Data Management
- [ ] Privacy settings can be updated
- [ ] Profile visibility controls work
- [ ] Data export generates complete JSON
- [ ] Account deletion removes all user data
- [ ] Deleted accounts cannot log in
- [ ] Privacy settings persist correctly

### Security Features
- [ ] All tables have RLS enabled
- [ ] Users cannot access other users' data
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] CSRF tokens work correctly
- [ ] Rate limiting prevents abuse
- [ ] Security audit log captures events

### Social Features
- [ ] User profiles display correctly
- [ ] Comments can be posted
- [ ] Comments display in correct order
- [ ] Reactions/votes increment correctly
- [ ] Users can see their activity history

### Search & Discovery
- [ ] Text search returns relevant results
- [ ] Location-based search works
- [ ] Category filters work correctly
- [ ] Search results are properly ranked
- [ ] Empty search states handle gracefully

### Progressive Web App
- [ ] App can be installed on mobile
- [ ] App works offline (cached content)
- [ ] Service worker updates properly
- [ ] Install prompt appears correctly
- [ ] App manifest is valid
- [ ] Icons display correctly

### Internationalization
- [ ] Language can be switched
- [ ] All UI text translates correctly
- [ ] Language preference persists
- [ ] Date/time formats localize
- [ ] Numbers format correctly per locale

### Performance
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] FID < 100ms (First Input Delay)
- [ ] CLS < 0.1 (Cumulative Layout Shift)
- [ ] Time to Interactive < 3.5s
- [ ] Initial load < 5s on 3G
- [ ] Map renders in < 2s

## Regression Testing

### When to Run
- Before every deployment
- After major feature additions
- After bug fixes
- Weekly scheduled runs

### Critical User Flows
1. **New User Onboarding**
   - Sign up → Verify email → Complete profile → Submit first story → View on map

2. **Map Exploration**
   - Load map → Browse stories → Click marker → Read story → React/comment

3. **Settings Management**
   - Access settings → Update notifications → Update privacy → Verify persistence

4. **Admin Workflows**
   - Access admin panel → Manage users → Assign roles → Moderate content

### Automated Regression Suite
```bash
# Run full regression suite
npm run test:regression

# Run critical path tests only
npm run test:critical
```

## Performance Benchmarks

### Load Time Targets
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Total Blocking Time (TBT): < 300ms
- Cumulative Layout Shift (CLS): < 0.1

### Database Query Performance
- List queries: < 100ms
- Single record queries: < 50ms
- Search queries: < 200ms
- Write operations: < 100ms

### API Response Times
- GET requests: < 200ms
- POST requests: < 300ms
- File uploads: < 2s (per MB)
- Edge functions: < 1s

### Map Performance
- Initial render: < 2s
- Marker cluster update: < 500ms
- Zoom/pan responsiveness: < 100ms
- 1000 markers render: < 3s

## Testing Best Practices

### Writing Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test user behavior, not implementation**
3. **Use semantic queries** (getByRole, getByLabelText)
4. **Avoid testing library internals**
5. **Keep tests isolated and independent**
6. **Mock external dependencies**
7. **Use data-testid sparingly** (prefer semantic queries)

### Test Coverage Goals
- Unit tests: > 80% coverage
- Integration tests: Critical paths covered
- E2E tests: All major user flows covered
- Accessibility: 100% of user-facing components

### Common Pitfalls
- ❌ Testing implementation details
- ❌ Not cleaning up after tests
- ❌ Tests that depend on other tests
- ❌ Hardcoded waits (use waitFor instead)
- ❌ Not testing error states
- ❌ Ignoring accessibility

### Debugging Failed Tests
1. Check test output for error messages
2. Use `screen.debug()` to see rendered output
3. Run test in headed mode: `npm run test:e2e -- --headed`
4. Use browser DevTools with Playwright inspector
5. Check screenshots/videos in test-results/
6. Verify test data and mocks are correct

## Continuous Integration

### Pre-commit Checks
```bash
# Run before committing
npm run lint
npm run type-check
npm run test:unit
```

### CI Pipeline
1. Lint & Type Check
2. Unit Tests
3. Integration Tests
4. Build
5. E2E Tests
6. Accessibility Tests
7. Performance Tests
8. Visual Regression Tests

## Reporting Issues

When tests fail, include:
- Test name and file
- Full error message
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/videos (for E2E tests)
- Environment details (browser, OS, etc.)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)
