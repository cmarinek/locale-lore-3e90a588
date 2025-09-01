# React TypeScript PWA

A modern, production-ready React TypeScript Progressive Web App with iOS-inspired design system and atomic architecture.

## 🚀 Features

- ⚡ **Vite** - Fast build tool and dev server
- 🔥 **React 18** - Latest React with concurrent features
- 🏗️ **TypeScript** - Full type safety
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📱 **PWA Ready** - Service worker and manifest configured
- 🍎 **iOS-inspired Design** - Modern, clean, and fluid animations
- 🧩 **Atomic Design** - Scalable component architecture
- 🔧 **shadcn/ui** - High-quality, accessible components
- 📏 **ESLint + Prettier** - Code formatting and linting
- 🐕 **Husky** - Git hooks for quality assurance
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

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
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

5. **Build for production:**
   ```bash
   npm run build
   ```

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript compiler

## 📱 PWA Features

- **Offline support** with service worker
- **App-like experience** on mobile devices
- **Installable** on iOS and Android
- **Fast loading** with optimized caching strategies

## 🚀 Deployment

Simply open [Lovable](https://lovable.dev/projects/8ee9bb21-9cd6-4b22-81a4-e2322ff21c98) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can! To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
