# Locale Lore

A location-based storytelling platform where users can discover, share, and explore local stories, historical facts, and points of interest on an interactive map.

## 🌟 Features

### Core Features (✅ Complete)

#### Authentication & User Management
- Email/password authentication with Supabase
- Email verification and password reset
- Session persistence and management
- Protected routes with automatic redirects
- User profiles with customizable settings

#### Role-Based Access Control (RBAC)
- Three user roles: Admin, Contributor, and User
- Granular permission system
- Route guards based on roles and permissions
- Admin dashboard for user and role management

#### Interactive Map
- Mapbox GL JS integration
- Real-time user location detection
- Custom markers for stories/facts
- Marker clustering for performance
- Mobile-friendly touch controls

#### Story/Fact Management
- Create, edit, and delete stories
- Rich media support (images)
- Category organization
- Location-based storage

#### Notification System
- In-app notifications
- Email notifications
- Customizable notification preferences
- Real-time updates

#### Privacy & Data Management (GDPR Compliant)
- Comprehensive privacy settings
- Profile visibility controls
- Complete data export (JSON)
- Account deletion with data removal

#### Security Features
- Row Level Security (RLS) on all tables
- SQL injection prevention
- XSS protection
- Security audit logging

#### Progressive Web App (PWA)
- Installable on mobile devices
- Offline support with service workers
- Native app-like experience

#### Internationalization (i18n)
- Multi-language support
- Language switching with persistence

## 🚀 Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend (PostgreSQL, Auth, Storage)
- **Mapbox GL JS** - Interactive maps
- **Playwright** - E2E testing
- **Jest** - Unit testing

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Mapbox API token

### Installation

```bash
npm install
```

### Environment Setup

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### Run Development Server

```bash
npm run dev
```

App available at `http://localhost:5173`

## 🧪 Testing

```bash
# All tests
npm run test

# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Build

```bash
npm run build
npm run preview
```

## 🔐 Security

All tables use Row Level Security (RLS). Policies ensure users can only access their own data.

## 🐛 Troubleshooting

### Auth Redirect Errors
Configure redirect URLs in Supabase: Authentication → URL Configuration

### Map Not Loading
- Verify Mapbox token in `.env`
- Check browser console for errors

### Database Errors
- Verify Supabase credentials
- Check RLS policies
- Ensure migrations ran

## 📊 Performance

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Initial load ~2.8s on 3G

## 📚 Documentation

- [Testing Guide](./docs/TESTING_GUIDE.md)
- [Implementation Status](/implementation-status)

## 📄 License

MIT License

---

Built with ❤️ using [Lovable.dev](https://lovable.dev)
