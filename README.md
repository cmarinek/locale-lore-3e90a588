# LocaleLore 🌍

**Discover and share local stories and hidden gems in your area.**

LocaleLore is a production-ready, full-stack web application that connects communities through location-based storytelling. Share fascinating facts about places you know, explore discoveries from others, and earn rewards for your contributions.

[![Production Ready](https://img.shields.io/badge/status-production%20ready-brightgreen)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📖 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Security](#-security)
- [Support](#-support)
- [License](#-license)

## ✨ Features

### 🗺️ Discovery & Exploration
- **Interactive Map** - Explore local facts on a beautiful Mapbox-powered map
- **Location Search** - Find interesting places and stories near you
- **Categories** - Filter by History, Culture, Food & Drink, Nature, and more
- **Trending Content** - Discover popular and recently added facts
- **Advanced Filters** - Search by keyword, location, or category

### 👥 Social & Community
- **User Profiles** - Customizable profiles with bio, avatar, and activity history
- **Friends System** - Connect with other explorers and contributors
- **Leaderboards** - Compete on global and friend leaderboards
- **Comments & Likes** - Engage with community content
- **Direct Messaging** - Chat with other users (coming soon)

### 🎮 Gamification & Rewards
- **XP System** - Earn experience points for contributions and engagement
- **User Levels** - Progress from Novice to Legend with increasing benefits
- **Achievements** - Unlock 50+ achievements for various milestones
- **Rewards Shop** - Purchase badges, titles, and customizations
- **Daily Streaks** - Earn bonuses for consistent activity

### 💰 Contributor Economy
- **Verified Contributors** - Apply to become a paid contributor
- **Quality Scoring** - Earn more with high-quality, engaging content
- **Tips** - Receive tips from users who love your content
- **Premium Content** - Create and sell exclusive guides and tours
- **Sponsored Partnerships** - Collaborate with brands (Expert tier)
- **Revenue Analytics** - Track earnings and performance

### 🔐 Authentication & Security
- **Email/Password Auth** - Traditional authentication with email verification
- **Google Sign-In** - Quick sign-in with Google OAuth
- **Role-Based Access** - Admin, Contributor, and Free user roles
- **Row Level Security** - Database-level access control with Supabase RLS
- **Privacy Controls** - Granular privacy settings for profile and activity

### 💳 Payment Processing
- **Stripe Integration** - Secure payment processing
- **Subscription Plans** - Premium subscriptions with recurring billing
- **One-Time Purchases** - Buy XP, badges, and other rewards
- **Promo Codes** - Support for promotional codes and discounts
- **Refund Management** - Admin-controlled refund processing

### 🤖 AI-Powered Features
- **Auto-Categorization** - AI categorizes submitted facts automatically
- **Content Recommendations** - Personalized discovery suggestions
- **Smart Search** - AI-enhanced search results
- **Content Moderation** - AI-assisted content quality checks

### 📱 Mobile & PWA
- **Progressive Web App** - Install on any device
- **Offline Support** - Access content without internet connection
- **Native Integrations** - Capacitor for iOS and Android
- **Responsive Design** - Optimized for all screen sizes
- **Geolocation** - Automatic location detection

### 🌍 Internationalization
- **Multi-Language** - Support for multiple languages
- **RTL Support** - Right-to-left language support
- **Auto-Detection** - Automatic language detection from browser
- **Translation Management** - Admin panel for managing translations

### 🛠️ Production-Ready
- **Performance Monitoring** - Real-time Web Vitals tracking
- **Error Tracking** - Sentry integration for error monitoring
- **Load Testing** - Performance testing and optimization
- **Security Audits** - Automated security scanning
- **Uptime Monitoring** - 24/7 uptime tracking
- **Analytics** - Comprehensive user behavior analytics

## 🚀 Technology Stack

### Frontend
- **React 18** - Latest React with concurrent features
- **TypeScript** - Full type safety across the codebase
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **React Router** - Client-side routing with lazy loading
- **React Query** - Powerful data fetching and caching
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management

### Backend & Infrastructure
- **Supabase** - PostgreSQL database with real-time features
- **Edge Functions** - Serverless functions on Deno runtime
- **Row Level Security** - Database-level access control
- **Supabase Auth** - Authentication with multiple providers
- **Supabase Storage** - File storage with CDN

### External Services
- **Mapbox GL JS** - Interactive maps and geocoding
- **Stripe** - Payment processing and subscriptions
- **Sentry** - Error tracking and performance monitoring
- **Google OAuth** - Social authentication

### Development & Testing
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks
- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **@axe-core/playwright** - Accessibility testing

### DevOps & Deployment
- **GitHub Actions** - CI/CD pipeline automation
- **Lovable.dev** - Production hosting platform
- **Vercel/Netlify** - Alternative deployment options
- **Docker** - Containerization (optional)

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

## 📚 Documentation

Comprehensive documentation is available in the project:

### User Documentation
- **[User Guide](USER_GUIDE.md)** - Complete guide for using LocaleLore
- **[Contributor Guide](CONTRIBUTOR_GUIDE.md)** - How to become a paid contributor
- **[FAQ Page](/faq)** - Frequently asked questions
- **[Content Guidelines](/content-guidelines)** - Content submission standards
- **[Privacy Policy](/privacy-policy)** - Privacy and data protection
- **[Terms of Service](/terms-of-service)** - Terms and conditions
- **[Refund Policy](/refund-policy)** - Refund and cancellation policy

### Technical Documentation
- **[Architecture](ARCHITECTURE.md)** - System architecture and design
- **[API Documentation](API_DOCUMENTATION.md)** - Edge functions and API reference
- **[Deployment Guide](DEPLOYMENT_RUNBOOK.md)** - Deployment procedures
- **[Security Guide](SECURITY.md)** - Security best practices

### Operational Documentation
- **[Admin Guide](ADMIN_GUIDE.md)** - Admin dashboard and procedures
- **[Incident Response](INCIDENT_RESPONSE.md)** - Incident handling procedures
- **[Backup & Restore](BACKUP_RESTORE.md)** - Backup and recovery procedures
- **[User Support](USER_SUPPORT.md)** - Support request handling

### Project Status
- **[Production Readiness Report](PRODUCTION_READINESS_REPORT.md)** - Production status
- **[Post-Launch Checklist](POST_LAUNCH_CHECKLIST.md)** - Post-launch tasks
- **[Known Issues](KNOWN_ISSUES.md)** - Known issues and workarounds
- **[Deployment Report](DEPLOYMENT_REPORT.md)** - Deployment checklist and status

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep PRs focused and atomic

## 📞 Support

### Getting Help
- **Email**: support@localelore.com
- **In-App Support**: Visit `/support` page
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check our comprehensive guides

### Community
- **Discord** - Join our community (coming soon)
- **Twitter** - Follow us @localelore (coming soon)
- **Blog** - Read about updates and tips (coming soon)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Amazing backend infrastructure
- **Lovable.dev** - Fantastic development platform
- **Mapbox** - Beautiful maps and geocoding
- **shadcn/ui** - Excellent component library
- **All Contributors** - Thank you for making LocaleLore better!

---

**Built with ❤️ using [Lovable.dev](https://lovable.dev)**
