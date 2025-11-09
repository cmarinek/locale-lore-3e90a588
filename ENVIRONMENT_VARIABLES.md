# Environment Variables Guide

## How Environment Variables Work in Lovable

Lovable uses Vite's environment variable system. Variables must be prefixed with `VITE_` to be accessible in your React application.

## Required Variables

### Supabase (Already Configured)
These are automatically set by Lovable when you connect to Supabase:

```bash
VITE_SUPABASE_URL=https://mwufulzthoqrwbwtvogx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

### Stripe (Required for Payments)

Add this in your Lovable project settings:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Where to set**: Lovable Project Settings → Environment Variables

**Important**: Only the **publishable** key goes here. The secret key is stored securely in Supabase secrets.

## Optional Variables

### Sentry (Error Tracking)
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Analytics
```bash
VITE_ANALYTICS_ID=your-analytics-id
```

## How to Add Environment Variables in Lovable

1. Go to your project settings
2. Find the "Environment Variables" section
3. Click "Add Variable"
4. Enter key and value
5. Save and redeploy

## Accessing Variables in Code

```typescript
import { config } from '@/config/environments';

// Use the config object
const stripeKey = config.stripePublishableKey;
const supabaseUrl = config.supabaseUrl;
```

**Never access directly with import.meta.env in components** - always use the `config` object from `src/config/environments.ts`.

## Testing Locally

Lovable automatically handles environment variables for you. When you preview your app, it uses the variables you've set in your project settings.

## Production Deployment

Environment variables are automatically included when you deploy through Lovable. Make sure to:

1. ✅ Set production values for all variables
2. ✅ Use live Stripe keys (pk_live_) instead of test keys
3. ✅ Update webhook URLs to use production URLs
4. ✅ Enable production monitoring (Sentry)

## Security Best Practices

### ✅ Safe to use in frontend (with VITE_ prefix):
- Publishable API keys (Stripe pk_)
- Supabase anon key
- Public analytics IDs
- API endpoints

### ❌ NEVER use in frontend:
- Secret API keys
- Private tokens
- Database passwords
- Webhook secrets

**These belong in Supabase Edge Function secrets**, not environment variables!

## Supabase Edge Function Secrets

For backend secrets (used in Edge Functions), configure them in Supabase:

1. Go to: https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/settings/functions
2. Add your secrets there (they're automatically available in edge functions as `Deno.env.get('SECRET_NAME')`)

Current secrets needed:
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## Troubleshooting

### Variable not found
- Make sure it's prefixed with `VITE_`
- Check spelling matches exactly
- Redeploy after adding new variables

### Undefined in production
- Verify variable is set in project settings
- Check production build includes the variable
- Clear cache and redeploy

### Wrong value showing
- Lovable caches env vars - redeploy to update
- Check you're not overriding in code
- Verify the right environment (dev/staging/prod)
