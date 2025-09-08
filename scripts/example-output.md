# Example Seeding Output

This shows the expected output from running the geocacher-friendly facts seeding pipeline.

## Dry Run Example

```bash
$ node scripts/seed-geocache-facts.cjs --dry-run --region=Europe --limit=3 --verbose
```

```
🌍 Starting geocacher-friendly facts seeding pipeline...

Options: {
  admin: false,
  dryRun: true,
  region: 'Europe',
  limit: 3,
  verbose: true,
  storageSync: false,
  skipDuplicateCheck: false
}

🗺️  Processing region: Europe
✅ Admin Supabase client initialized
👤 Using author ID: a1b2c3d4-e5f6-7890-abcd-ef1234567890
📦 Created category: history
✅ Generated: "Ancient ruins hidden in Paris" in Paris, France
✅ Generated: "Traditional craft workshop in Paris" in Paris, France
✅ Generated: "Hidden waterfall near London" in London, United Kingdom
📦 Created category: culture
✅ Generated: "Secret tunnel system in London" in London, United Kingdom
✅ Generated: "Mysterious symbols in Rome" in Rome, Italy
📦 Created category: nature
✅ Generated: "Endemic species habitat near Rome" in Rome, Italy

📊 Region Europe Summary:
   Generated: 6 facts
   Skipped duplicates: 0

🔍 DRY RUN: Would insert 6 facts

🎉 Seeding pipeline completed!
📈 Total Summary:
   Processed: 6 facts
   Skipped: 0 duplicates
   Errors: 0 failures

💡 This was a dry run. Use without --dry-run to actually insert data.
```

## Full Production Run Example

```bash
$ node scripts/seed-geocache-facts.cjs --admin --storage-sync --region=Asia --limit=10
```

```
🌍 Starting geocacher-friendly facts seeding pipeline...

🗺️  Processing region: Asia
✅ Admin Supabase client initialized
👤 Using author ID: admin-user-id-12345
📦 Created category: mystery
✅ Generated: "Lost treasure site near Tokyo" in Tokyo, Japan
⏭️  Skipped duplicate: "Historic battleground near Tokyo"
✅ Generated: "Festival grounds of Bangkok" in Bangkok, Thailand
💾 Mirrored 25 facts to storage: seed-backup-Asia-2023-12-08T15-45-30-789Z.json

📊 Region Asia Summary:
   Generated: 25 facts
   Skipped duplicates: 3

💾 Inserting 25 facts into database...
✅ Successfully inserted 25 facts for Asia

🎉 Seeding pipeline completed!
📈 Total Summary:
   Processed: 25 facts
   Skipped: 3 duplicates
   Errors: 0 failures
```

## Example Generated Facts

### History Category
- **Title**: "Ancient ruins hidden in Kyoto"
- **Description**: "Archaeological remains dating back over 1200 years can be found near the ancient temple. These ruins tell the story of Byzantine Empire and offer geocachers a glimpse into the past."
- **Location**: Kyoto, Japan
- **Coordinates**: 35.0158, 135.7679

### Culture Category  
- **Title**: "Traditional craft workshop in Istanbul"
- **Description**: "Local artisans still practice the ancient art of pottery using techniques passed down for 8 generations. Visitors can observe and learn about this cultural heritage."
- **Location**: Istanbul, Turkey
- **Coordinates**: 41.0095, 28.9812

### Nature Category
- **Title**: "Hidden waterfall near Singapore"  
- **Description**: "A spectacular 75-meter waterfall cascades through limestone rocks, creating a natural wonder perfect for geocaching adventures. Best accessed via forest trail."
- **Location**: Singapore, Singapore
- **Coordinates**: 1.3498, 103.8234

### Mystery Category
- **Title**: "Unexplained phenomena in Hong Kong"
- **Description**: "Local legends speak of magnetic anomalies that occurs during full moons in this area. While scientists debate the cause, geocachers often report unusual compass deviations."
- **Location**: Hong Kong, Hong Kong  
- **Coordinates**: 22.3156, 114.1712

## Error Handling Example

```
🌍 Starting geocacher-friendly facts seeding pipeline...

🗺️  Processing region: InvalidRegion
⚠️  Region 'InvalidRegion' not found in cities data

🗺️  Processing region: Europe
❌ Database insertion error for Europe: duplicate key value violates unique constraint
⚠️  Storage mirror failed: bucket 'seed-backups' does not exist

📈 Total Summary:
   Processed: 0 facts
   Skipped: 2 duplicates  
   Errors: 15 failures
```