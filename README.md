# GeoCache Lore

A production-ready web application with comprehensive monitoring, testing, and deployment automation. Discover and explore local stories, culture, and hidden gems in your area.

## 🚀 Features

### Core Features
- ✅ **Authentication & Authorization** - Role-based access control (admin, contributor, free)
- ✅ **Admin Dashboard** - Complete admin panel with user management, role assignment, and promo codes
- ✅ **Database Integration** - Supabase with real-time data and Row Level Security
- ✅ **Payment Processing** - Stripe integration for subscriptions and one-time payments
- ✅ **AI Features** - Categorization, recommendations, and suggestions
- ✅ **Mobile Support** - Capacitor integration for iOS and Android

### Production Features
- ✅ **Performance Monitoring** - Real-time Web Vitals tracking with production dashboard
- ✅ **Error Tracking** - Sentry integration for comprehensive error monitoring
- ✅ **CI/CD Pipeline** - Automated testing, linting, and deployment via GitHub Actions
- ✅ **E2E Testing** - Playwright test suite covering critical user flows
- ✅ **Accessibility** - Automated a11y testing with axe-core
- ✅ **PWA** - Service worker for offline functionality
- ✅ **Internationalization** - Multi-language support with i18n

### Technology Stack
- ⚡ **Vite** - Fast build tool and dev server
- 🔥 **React 18** - Latest React with concurrent features
- 🏗️ **TypeScript** - Full type safety
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔧 **shadcn/ui** - High-quality, accessible components
- 🔀 **React Router** - Client-side routing
- 🌐 **React Query** - Data fetching and caching

## 📁 Project Structure

```
src/
├── components/
│   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   ├── molecules/      # Component combinations (InputField, SearchBox)
│   ├── organisms/      # Complex components (Header, ProductList)
│   ├── templates/      # Page layouts (MainLayout, AuthLayout)
│   └── ui/            # shadcn/ui components
├── pages/             # Route components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── utils/             # Helper functions and constants
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend features)

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Required variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup Git hooks:**
   ```bash
   chmod +x scripts/setup-husky.sh
   ./scripts/setup-husky.sh
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Main app: http://localhost:5173
   - Production dashboard: http://localhost:5173/production
   - Admin panel: http://localhost:5173/admin

## 🎨 Design System

The app uses an iOS-inspired design system with:

- **Inter font family** for clean typography
- **Fluid animations** with `cubic-bezier(0.16, 1, 0.3, 1)` easing
- **Subtle shadows** and glass morphism effects
- **Semantic color tokens** for consistent theming
- **Dark mode support** out of the box

### Using the Design System

```tsx
// Use semantic tokens
<div className="bg-primary text-primary-foreground" />

// Apply iOS-inspired effects
<div className="glass elevation-2 animate-fade-in" />

// Consistent spacing and typography
<h1 className="text-4xl font-bold leading-tight" />
```

## 📦 Component Guidelines

### Atoms
Basic building blocks that can't be broken down further:
```tsx
import { Button, Input, Label } from '@/components/atoms';
```

### Molecules
Combinations of atoms that work together:
```tsx
import { InputField } from '@/components/molecules/InputField';

<InputField 
  label="Email" 
  error="Required field" 
  description="We'll never share your email"
/>
```

### Organisms
Complex components made of molecules and atoms:
```tsx
import { WelcomeHero } from '@/components/organisms/WelcomeHero';
```

### Templates
Page-level layout components:
```tsx
import { MainLayout } from '@/components/templates/MainLayout';

<MainLayout>
  <YourPageContent />
</MainLayout>
```

## 🔧 Development Scripts

### Core Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler

### Testing Scripts
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests in UI mode
- `npm run test:e2e:debug` - Debug E2E tests

## 🧪 Testing

### Unit Tests
```bash
npm test
npm run test:coverage
```

### E2E Tests
The project includes comprehensive E2E tests covering:
- Authentication flow
- Admin dashboard functionality
- Navigation and routing
- Accessibility compliance
- Production dashboard

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode for development
npm run test:e2e:ui

# Debug specific tests
npm run test:e2e:debug
```

### Accessibility Testing
All E2E tests include automated accessibility audits using @axe-core/playwright to ensure WCAG 2.1 AA compliance.

## 📱 PWA Features

- **Offline support** with service worker
- **App-like experience** on mobile devices
- **Installable** on iOS and Android
- **Fast loading** with optimized caching strategies

## 🛠️ Known Browser Behaviors

### Geolocation Errors
You may see console errors like `TypeError: can't access property "getCurrentPosition", navigator.geolocation is undefined` in certain environments. This is expected behavior when:
- Running in environments without geolocation support (some server-side rendering contexts)
- Using browsers with geolocation disabled
- Testing in certain CI/CD environments

The app includes polyfills and fallback mechanisms to handle these cases gracefully, falling back to region-based location detection using timezone and language settings.

## 🚀 Deployment

### Automated CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline that runs on every push and pull request:

**Pipeline Steps:**
1. **Linting** - ESLint validation
2. **Type Checking** - TypeScript compilation
3. **Unit Tests** - Jest test suite with coverage
4. **E2E Tests** - Playwright across multiple browsers
5. **Security Audit** - npm audit for vulnerabilities
6. **Build** - Production build generation
7. **Lighthouse** - Performance auditing
8. **Deploy** - Automatic deployment to production (main branch only)

### Production Readiness Check

Before deploying, run the production readiness script:
```bash
bash scripts/production-deploy.sh
```

This validates:
- ✅ TypeScript compilation
- ✅ Linting passes
- ✅ All tests pass
- ✅ Security vulnerabilities checked
- ✅ Bundle size analysis
- ✅ Environment variables validated
- ✅ PWA requirements met

### Manual Deployment

Build for production:
```bash
npm run build
```

The optimized files will be in the `dist` directory. Deploy to:
- **Vercel** - Connect repository for automatic deployments
- **Netlify** - Drag and drop `dist` folder or connect via Git
- **GitHub Pages** - Use `dist` output for static hosting
- **Your own server** - Serve `dist` folder with any web server

### Environment Variables for Production

Set these in your hosting platform:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_key
VITE_SENTRY_DSN=your_sentry_dsn (optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional)
```

## 📊 Production Monitoring

### Production Dashboard
Access at `/production` to monitor:
- **System Health** - Real-time status checks
- **Performance Metrics** - Web Vitals (LCP, FID, CLS)
- **Security Audit** - Vulnerability scanning
- **Load Testing** - Performance under load
- **Error Tracking** - Error rates and alerts

### Monitoring Integrations
- **Sentry** - Error tracking and performance monitoring
- **Custom Analytics** - User behavior tracking
- **Web Vitals** - Core performance metrics
- **Load Testing** - Synthetic load generation

## 🔐 Security

### Security Features
- **Row Level Security (RLS)** - Database-level access control
- **Role-Based Access** - Separate roles (admin, contributor, free)
- **Secure Authentication** - Supabase Auth with multiple providers
- **Environment Variables** - Secure secret management
- **Content Security Policy** - XSS protection
- **HTTPS Enforcement** - Secure communication

### Admin Access
1. Sign up/sign in to the application
2. Navigate to `/make-admin` to assign yourself admin role
3. Access admin panel at `/admin`

Note: In production, assign admin roles through direct database access for security.
