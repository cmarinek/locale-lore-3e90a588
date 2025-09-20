# 🎨 UI Modernization Scripts

This directory contains automated scripts to modernize the LocaleLore UI to match CashApp's clean, minimal design.

## 🚀 Usage via GitHub Actions

1. **Go to your GitHub repository**
2. **Navigate to Actions tab**
3. **Find "🎨 Modernize UI - CashApp Style" workflow**
4. **Click "Run workflow"**
5. **Choose phases to run:**
   - `all` - Run all modernization phases
   - `header` - Modernize header only
   - `search` - Modernize search bar only
   - `markers` - Modernize map markers only
   - `bottom-bar` - Add modern bottom action bar
   - `views` - Modernize view controls

## 📱 Modernization Phases

### Phase 1: Header (`header`)
- Simplifies header to match CashApp's minimal design
- Removes complex navigation elements
- Adds clean back button navigation

### Phase 2: Search (`search`)
- Replaces search with CashApp-style input
- Adds "Near me" location button
- Removes filter pills from main view

### Phase 3: Markers (`markers`)
- Updates map markers to circular branded style
- Implements category-based color coding
- Adds verification badges

### Phase 4: Bottom Bar (`bottom-bar`)
- Adds prominent bottom action button
- Implements swipe-up action sheets
- Replaces complex navigation

### Phase 5: Views (`views`)
- Simplifies List/Map toggle
- Removes side category filters
- Reduces visual complexity

## 🔧 Local Development

If you want to run scripts locally:

```bash
# Make scripts executable
chmod +x ./scripts/modernize.sh

# Run all phases
./scripts/modernize.sh all

# Run specific phase
./scripts/modernize.sh header
```

## 💾 Automatic Sync

After GitHub Actions completes:
1. Changes are automatically committed to your repository
2. Lovable will sync the changes automatically
3. You'll see the modernized UI in your Lovable preview

## 🎯 Design Goals

- **Minimal**: Remove visual clutter
- **Clean**: Use CashApp's design patterns
- **Modern**: Implement contemporary UI standards
- **Consistent**: Unified design language
- **Mobile-first**: Optimized for mobile experience

## 🔄 Rollback

If you need to revert changes:
1. Use Lovable's built-in version history
2. Or revert the Git commit in your repository
3. Lovable will sync the rollback automatically

---

# LocaleLore Facts Seeding Pipeline

This directory also contains scripts for seeding the LocaleLore database with interesting facts across multiple regions worldwide.

## Data Seeding Files

### `utils/supabaseAdmin.cjs`
Admin Supabase client utilities providing:
- `getAdminClient()` - Get Supabase client with service role key
- `getUserIdByEmail(email)` - Find user ID by email with admin privileges  
- `storage` - Storage operations (upload, download, list, remove, copy, getPublicUrl)

### `data/cities.json`
Contains cities grouped by regions:
- **Europe**: 15 cities (Paris, London, Rome, Barcelona, etc.)
- **Africa**: 15 cities (Cairo, Cape Town, Marrakech, Lagos, etc.)
- **Americas**: 15 cities (NYC, Mexico City, Buenos Aires, etc.)
- **Asia**: 15 cities (Tokyo, Bangkok, Singapore, Hong Kong, etc.)  
- **Oceania**: 15 cities (Sydney, Melbourne, Auckland, etc.)

Each city includes:
- `name` - City name
- `country` - Country name
- `lat`, `lng` - GPS coordinates
- `radiusKm` - Optional search radius (default: 10km)

### `seed-geocache-facts.cjs`
Main seeding script with features:
- **Storage mirroring** - Backup facts to Supabase storage
- **Idempotency/duplicate detection** - Prevents duplicate facts
- **Expanded city coverage** - 75 cities across 5 regions
- **CLI options** - Flexible execution modes

## Usage

### Environment Setup
```bash
# Required
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional
export ADMIN_EMAIL="admin@example.com"
```

### Basic Usage
```bash
# Dry run to preview generated facts
node scripts/seed-geocache-facts.cjs --dry-run --verbose

# Seed all regions with admin privileges
node scripts/seed-geocache-facts.cjs --admin --storage-sync

# Seed specific region with limit
node scripts/seed-geocache-facts.cjs --region=Europe --limit=50

# Quick seeding (skip duplicate checks)
node scripts/seed-geocache-facts.cjs --skip-duplicate-check --limit=20
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--admin` | Use admin privileges for seeding |
| `--dry-run` | Preview without making database changes |
| `--region=<name>` | Process only specific region |
| `--limit=<number>` | Limit facts per region |
| `--verbose, -v` | Show detailed logging |
| `--storage-sync` | Enable storage mirroring/backup |
| `--skip-duplicate-check` | Skip duplicate detection (faster) |
| `--help, -h` | Show usage information |

### Regions Available
- `Europe` - 15 European cities
- `Africa` - 15 African cities  
- `Americas` - 15 cities across North/South America
- `Asia` - 15 Asian cities
- `Oceania` - 15 cities in Australia/New Zealand/Pacific

## Features

### Geocacher-Friendly Facts
The script generates diverse, location-based facts perfect for geocaching:

**Categories:**
- **History** - Ancient ruins, battlegrounds, secret tunnels
- **Culture** - Traditional crafts, festivals, sacred sites
- **Nature** - Waterfalls, geological formations, endemic species
- **Mystery** - Unexplained phenomena, lost treasures, ancient symbols

### Storage Mirroring
When `--storage-sync` is enabled:
- Facts are backed up to `seed-backups` storage bucket
- JSON format with timestamp and region metadata
- Provides recovery/audit trail for seeding operations

### Duplicate Detection
Prevents duplicate facts by checking:
- Exact matches (title + location)
- Proximity matches (within 100m radius)
- Uses SHA-256 hashing for efficient comparison
- Can be disabled with `--skip-duplicate-check` for speed

### Idempotency
- Safe to run multiple times
- Existing facts won't be duplicated
- Hash-based deduplication ensures consistency

## Example Output

```bash
🌍 Starting geocacher-friendly facts seeding pipeline...

🗺️  Processing region: Europe
👤 Using author ID: 12345678-1234-5678-9012-123456789abc
📦 Created category: history
✅ Generated: "Ancient ruins hidden in Paris" in Paris, France
✅ Generated: "Secret tunnel system in London" in London, United Kingdom
💾 Mirrored 45 facts to storage: seed-backup-Europe-2023-12-08T10-30-45-123Z.json

📊 Region Europe Summary:
   Generated: 45 facts
   Skipped duplicates: 3

💾 Inserting 45 facts into database...
✅ Successfully inserted 45 facts for Europe

🎉 Seeding pipeline completed!
📈 Total Summary:
   Processed: 45 facts
   Skipped: 3 duplicates
   Errors: 0 failures
```

## Database Schema

The script works with these tables:
- `facts` - Main facts table with geolocation
- `categories` - Fact categories (auto-created if missing)
- `profiles` - User profiles (for author assignment)
- `user_roles` - For admin user detection

## Storage Requirements

If using `--storage-sync`:
- Requires `seed-backups` storage bucket in Supabase
- Service role key must have storage write permissions
- Backup files are JSON format, ~1-5KB per fact