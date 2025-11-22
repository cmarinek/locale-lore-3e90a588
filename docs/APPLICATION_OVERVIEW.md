# LocaleLore: Application Overview

## Executive Summary

LocaleLore is a location-based platform that connects people with the hidden history, culture, and stories of places around them. It combines the discovery aspects of Google Maps, the social engagement of Instagram, and the knowledge preservation of Wikipedia into a unified mobile-first experience.

## Core Value Proposition

**"Discover the stories behind every place, preserve local knowledge, and share moments that matter."**

LocaleLore serves two primary user needs:
1. **Historical Discovery**: Find verified, permanent facts and lore about locations
2. **Social Sharing**: Share ephemeral moments and experiences (Instagram-style)

---

## Architecture Overview

### Two-Content Model

LocaleLore distinctly separates two types of content to serve different user needs:

#### 1. **Facts/Lore** (Permanent Historical Content)
- **Database Table**: `facts`
- **Lifecycle**: Permanent, verified content
- **Purpose**: Educational, historical, cultural preservation
- **Features**:
  - Location-based (latitude/longitude with PostGIS geography)
  - Category system (historical periods, landmarks, cultural sites)
  - Moderation workflow: `pending` → `verified` → `rejected`
  - Metadata: tags, source URLs, time periods
  - Social engagement: voting (up/down), comments, saves
  - Search: by location, category, tags, keywords
  - Verification: Admin/moderator review required

**Example Fact**:
```
Title: "Original Site of Liberty Bell"
Description: "Before 1976, the Liberty Bell was housed in Independence Hall..."
Time Period: "1776-1976"
Tags: ["revolutionary-war", "philadelphia", "liberty-bell"]
Source: "https://nps.gov/inde/liberty-bell"
Status: verified
```

#### 2. **Stories** (Ephemeral Social Content)
- **Database Table**: `stories`
- **Lifecycle**: 24-hour expiration (`expires_at`)
- **Purpose**: Social engagement, real-time sharing
- **Features**:
  - Media-first (images/videos)
  - Trending algorithm (`is_trending`)
  - View counts, reactions
  - No verification required
  - Quick, casual content

**Example Story**:
```
"Just discovered this amazing street art! 🎨"
[Photo of mural]
Expires: 24 hours from posting
```

---

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand (mapStore, discoveryStore, appStore)
- **UI Components**: Shadcn UI (Radix UI primitives)
- **Styling**: TailwindCSS with custom theme
- **Maps**: Mapbox GL JS v3
- **Internationalization**: i18next with RTL support
- **Build Tool**: Vite

### Backend Stack
- **Database**: Supabase (PostgreSQL 15+)
- **Authentication**: Supabase Auth (email, OAuth)
- **Storage**: Supabase Storage (images, media)
- **Real-time**: Supabase Realtime (notifications, live updates)
- **Spatial**: PostGIS for geographic queries

### Key Libraries
- **Validation**: Zod schemas
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Geocoding**: Mapbox Geocoding API
- **Directions**: Mapbox Directions API

---

## Feature Breakdown

### 1. Interactive Map (`/map`)

**Purpose**: Google Maps-style exploration of local facts and lore

**Features**:
- **Geocoding Search**: Address/place search with autocomplete
- **Location Services**: "Near Me" with device geolocation
- **Map Markers**: Facts displayed as clustered markers
- **Side Panel**: Google Maps-style results panel (desktop)
- **Filters**: Category, status (verified/pending), custom filters
- **Detail View**: Click marker to see full fact details
- **Create Mode**: Right-click to add new fact at location
- **Map Controls**: Zoom, compass, geolocation button

**User Flow**:
1. Search for location or use "Near Me"
2. Browse facts on map (clustered for performance)
3. Click marker to view details in side panel
4. Filter by category/status
5. Save, vote, or comment on facts
6. Right-click to submit new fact

### 2. Explore/Discovery (`/explore`)

**Purpose**: Browse facts by location and category

**Features**:
- List view of facts
- Location-based sorting (distance from user)
- Category filters
- Quick navigation to map view
- Saved facts collection

### 3. Stories Feed (`/stories`)

**Purpose**: Instagram-style ephemeral content feed

**Features**:
- 24-hour expiring content
- Story viewer (swipe through)
- Trending stories
- User stories (view by profile)
- Camera integration for creation
- View counts and reactions

### 4. Search (`/search`)

**Purpose**: Full-text search across content

**Features**:
- Search facts by title, description, location
- Search users and profiles
- Filter results by type
- Recent searches

### 5. User Profiles (`/profile/:userId`)

**Purpose**: Personal contribution dashboard

**Features**:
- User's submitted facts (pending/verified)
- User's stories
- Saved facts collection
- Activity history
- Statistics (contributions, points)
- Follow/follower system

### 6. Gamification (`/gamification`)

**Purpose**: Encourage quality contributions

**Features**:
- Points system for verified facts
- Badges and achievements
- Leaderboards
- Contributor levels (Bronze → Silver → Gold → Platinum)
- Streak tracking

### 7. Social Features (`/social`)

**Purpose**: Community engagement

**Features**:
- Follow users
- Activity feed
- Notifications (new comments, votes, verifications)
- User discovery

### 8. Admin Panel (`/admin`)

**Purpose**: Content moderation and platform management

**Features**:
- Fact verification queue
- User management
- Category management
- Analytics dashboard
- Flag/report handling

---

## Database Schema (Key Tables)

### `facts`
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- location_name (TEXT)
- latitude, longitude (DECIMAL)
- geolocation (GEOGRAPHY - PostGIS)
- category_id (UUID → categories)
- status (ENUM: pending, verified, rejected)
- media_urls (TEXT[])
- author_id (UUID → profiles)
- verified_by (UUID → profiles)
- vote_count_up, vote_count_down (INTEGER)
- tags (TEXT[]) - NEW
- source_url (TEXT) - NEW
- time_period (TEXT) - NEW
- created_at, updated_at (TIMESTAMPTZ)
```

### `stories`
```sql
- id (UUID)
- author_id (UUID → profiles)
- media_url (TEXT)
- caption (TEXT)
- location (GEOGRAPHY)
- expires_at (TIMESTAMPTZ) - 24 hours from creation
- is_trending (BOOLEAN)
- view_count (INTEGER)
- created_at (TIMESTAMPTZ)
```

### `categories`
```sql
- id (UUID)
- slug (TEXT) - e.g., "historical-landmarks"
- icon (TEXT) - emoji or icon name
- category_translations (relation to multilingual names)
```

### `profiles`
```sql
- id (UUID)
- username (TEXT)
- full_name (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- points (INTEGER)
- role (ENUM: user, moderator, admin)
- created_at (TIMESTAMPTZ)
```

### Supporting Tables
- `votes` - fact voting (upvote/downvote)
- `comments` - threaded comments on facts
- `saved_facts` - user's saved/bookmarked facts
- `notifications` - user notifications
- `followers` - social graph
- `achievements` - gamification badges

---

## User Roles & Permissions

### Guest (Unauthenticated)
- ✅ View map and explore facts
- ✅ Search content
- ✅ View public profiles
- ❌ Cannot submit facts/stories
- ❌ Cannot vote, comment, or save
- ❌ Cannot follow users

### Free User (Authenticated)
- ✅ All guest permissions
- ✅ Submit facts (requires verification)
- ✅ Create stories (24hr)
- ✅ Vote and comment
- ✅ Save facts
- ✅ Follow users
- ✅ Earn points and badges
- ❌ No priority verification

### Moderator
- ✅ All free user permissions
- ✅ Verify facts
- ✅ Reject inappropriate content
- ✅ Manage flags/reports
- ❌ Limited admin access

### Admin
- ✅ Full platform access
- ✅ User management
- ✅ Category management
- ✅ Analytics dashboard
- ✅ System configuration

---

## Mobile-First Design

LocaleLore is designed mobile-first with progressive enhancement for desktop:

### Mobile (< 768px)
- Bottom navigation bar (5 tabs)
- Full-screen map experience
- Touch-optimized controls
- Swipe gestures for stories
- Haptic feedback
- Safe area insets for notched devices (iPhone X+)
- PWA-ready (installable)

### Tablet (768px - 1024px)
- Adaptive navigation
- Split-view map + panel
- Optimized touch targets

### Desktop (> 1024px)
- Header navigation
- Google Maps-style side panel
- Keyboard shortcuts
- Hover states and tooltips

---

## Internationalization (i18n)

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Arabic (ar) - RTL support
- Hebrew (he) - RTL support
- Chinese (zh)
- Japanese (ja)

### Translation Strategy
- UI strings: i18next JSON files
- Content (facts/categories): Database `*_translations` tables
- Dynamic language switching
- URL-based locale detection
- RTL layout support with direction-aware components

---

## Key User Flows

### 1. Discover Local History
```
User opens app
→ Grants location permission
→ Map centers on current location
→ Facts load as markers (clustered)
→ Clicks marker to view details
→ Reads fact, sees source, votes up
→ Saves fact to collection
→ Views related facts nearby
```

### 2. Submit a Fact
```
User finds interesting location
→ Clicks "Add Fact" or right-clicks map
→ Fills form:
   - Title: "Historic Train Station"
   - Description: "Built in 1892..."
   - Category: Historical Landmarks
   - Time Period: "1892-1950"
   - Tags: "railroad, architecture"
   - Source: "https://historic-society.org/..."
→ Submits (status: pending)
→ Receives notification when verified
→ Earns points when published
```

### 3. Share a Story
```
User discovers something interesting
→ Opens Stories tab
→ Takes photo/video
→ Adds caption
→ Shares (expires in 24hrs)
→ Friends see in Stories feed
→ Story goes trending if popular
→ Auto-deletes after 24 hours
```

### 4. Moderation Flow
```
User submits fact (status: pending)
→ Appears in Admin verification queue
→ Moderator reviews:
   - Checks source URL
   - Verifies accuracy
   - Checks location coordinates
   - Validates category
→ Approves (status: verified)
→ User receives notification
→ User earns points/badges
→ Fact appears on public map
```

---

## Performance Optimizations

### Map Performance
- Marker clustering (reduce rendering overhead)
- Viewport-based loading (only fetch visible facts)
- Debounced search (reduce API calls)
- Cached geocoding results
- Progressive marker rendering

### Data Loading
- React Query for caching
- Supabase real-time subscriptions (selective)
- Lazy loading for routes
- Image lazy loading
- Infinite scroll for lists

### Bundle Optimization
- Code splitting by route
- Dynamic imports for heavy components
- Tree-shaking unused code
- Compressed assets (gzip/brotli)

---

## Security Considerations

### Authentication
- Supabase Auth with JWT tokens
- Refresh token rotation
- Session expiration
- OAuth providers (Google, GitHub, etc.)

### Authorization
- Row-Level Security (RLS) policies in Supabase
- Role-based access control (RBAC)
- User can only edit own content
- Admins bypass RLS with service role

### Content Safety
- User-submitted content moderation queue
- Profanity filters
- Report/flag system
- IP-based rate limiting
- CAPTCHA for submission (if needed)

### Data Privacy
- GDPR compliance
- User data export
- Account deletion (cascade deletes)
- Privacy settings (public/private profiles)

---

## Analytics & Metrics

### Key Performance Indicators (KPIs)
- Daily Active Users (DAU)
- Fact submissions (pending → verified ratio)
- Story creation rate
- User retention (D1, D7, D30)
- Geographic coverage (facts per region)
- Verification queue time

### User Engagement Metrics
- Facts viewed per session
- Average session duration
- Map interactions (zooms, pans, clicks)
- Vote participation rate
- Comment activity
- Story view-through rate

---

## Future Considerations

### Potential Enhancements
1. **Fact Tours**: Guided routes through historical sites (partially implemented)
2. **Audio Guides**: Voice narration for facts
3. **AR Mode**: Augmented reality view of historical facts
4. **Premium Features**: Priority verification, ad-free, exclusive content
5. **Collaborative Editing**: Wikipedia-style fact improvements
6. **API for Third Parties**: Public API for developers
7. **Offline Mode**: Download facts for offline viewing
8. **Photo Verification**: Before/after comparisons
9. **Expert Badges**: Verified historians/local experts
10. **Fact Collections**: Curated thematic tours

---

## Development Environment

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- Mapbox account (API key)

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAPBOX_TOKEN=your-mapbox-token
```

### Local Development
```bash
npm install
npm run dev
# Runs on http://localhost:5173
```

### Database Migrations
```bash
# Apply migrations
npx supabase db push

# Reset database
npx supabase db reset
```

---

## Deployment

### Frontend
- Hosting: Vercel, Netlify, or Cloudflare Pages
- Build: `npm run build`
- Environment: Production environment variables
- CDN: Static assets via CDN

### Backend
- Supabase Cloud (managed PostgreSQL + Auth + Storage)
- Automatic scaling
- Backups enabled

---

## Support & Documentation

### For Users
- Help Center: `/help`
- Feedback Widget: In-app feedback tool
- FAQ: Common questions

### For Developers
- API Documentation: (if public API exists)
- Component Library: Storybook (if implemented)
- Database Schema Docs: `/docs/schema.md`
- Contributing Guide: `/docs/CONTRIBUTING.md`

---

## Contact & Governance

### Team Roles
- Product Owner: Platform vision and roadmap
- Developers: Feature implementation
- Moderators: Content verification
- Community Managers: User engagement

### Content Policy
- Facts must be verifiable (source required)
- No hate speech or harassment
- Respect copyright (use public domain or licensed media)
- Geographic accuracy required
- Historical accuracy expected (subject to verification)

---

## Version History

- **v1.0** - Initial launch (Facts + Map)
- **v1.1** - Stories feature added
- **v1.2** - Gamification system
- **v1.3** - Enhanced fact metadata (tags, sources, time periods) ← **Current**

---

## Glossary

- **Fact**: Permanent, verified location-based historical/cultural information
- **Story**: Ephemeral (24hr) social content, Instagram-style
- **Lore**: Synonym for Facts, emphasizes cultural/historical narrative
- **Verification**: Admin/moderator review process for submitted facts
- **Geocoding**: Converting addresses to latitude/longitude coordinates
- **GIN Index**: PostgreSQL Generalized Inverted Index for fast array searches
- **RLS**: Row-Level Security, PostgreSQL security feature
- **PostGIS**: PostgreSQL extension for geographic data
- **PWA**: Progressive Web App, installable web application

---

**Document Version**: 1.0
**Last Updated**: 2025-01-22
**Maintained By**: Development Team
