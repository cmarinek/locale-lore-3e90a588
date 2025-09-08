# Geocacher-Friendly Facts Seeding Pipeline

This directory contains scripts for seeding the Locale Lore database with geocacher-friendly facts across multiple regions worldwide.

## Files

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