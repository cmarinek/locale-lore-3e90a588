#!/usr/bin/env node

/**
 * Geocacher-Friendly Facts Seeding Pipeline
 * 
 * This script seeds the database with interesting geocache-worthy facts
 * with storage mirroring, idempotency/duplicate detection, and expanded city coverage.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getAdminClient, getUserIdByEmail, storage } = require('./utils/supabaseAdmin.cjs');
require('dotenv').config();

// CLI argument parsing
const args = process.argv.slice(2);
const options = {
  admin: args.includes('--admin'),
  dryRun: args.includes('--dry-run'),
  region: args.find(arg => arg.startsWith('--region='))?.split('=')[1],
  limit: parseInt(args.find(arg => arg.startsWith('--limit='))?.split('=')[1]) || null,
  verbose: args.includes('--verbose') || args.includes('-v'),
  storageSync: args.includes('--storage-sync'),
  skipDuplicateCheck: args.includes('--skip-duplicate-check')
};

// Load cities data
let citiesData;
try {
  const citiesPath = path.join(__dirname, 'data', 'cities.json');
  citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
} catch (error) {
  console.error('❌ Failed to load cities data:', error.message);
  process.exit(1);
}

// Geocache-friendly fact templates
const factTemplates = [
  {
    category: 'history',
    templates: [
      {
        title: 'Ancient ruins hidden in {city}',
        description: 'Archaeological remains dating back over {years} years can be found near {landmark}. These ruins tell the story of {civilization} and offer geocachers a glimpse into the past.',
        keywords: ['ruins', 'archaeology', 'ancient', 'historical']
      },
      {
        title: 'Historic battleground near {city}',
        description: 'A significant battle took place here in {year}, where {army1} faced {army2}. The area still contains remnants and markers that geocachers can discover.',
        keywords: ['battle', 'war', 'historic', 'military']
      },
      {
        title: 'Secret tunnel system in {city}',
        description: 'Underground tunnels built in {era} served as {purpose}. Parts of this network are still accessible and make for exciting urban geocaching adventures.',
        keywords: ['tunnel', 'underground', 'secret', 'urban']
      }
    ]
  },
  {
    category: 'culture',
    templates: [
      {
        title: 'Traditional craft workshop in {city}',
        description: 'Local artisans still practice the ancient art of {craft} using techniques passed down for {generations} generations. Visitors can observe and learn about this cultural heritage.',
        keywords: ['craft', 'traditional', 'artisan', 'cultural']
      },
      {
        title: 'Festival grounds of {city}',
        description: 'Every {season}, locals celebrate the {festival_name} festival here with {tradition}. The celebration grounds hold cultural significance and hidden symbols.',
        keywords: ['festival', 'celebration', 'cultural', 'tradition']
      },
      {
        title: 'Sacred site near {city}',
        description: 'This sacred location has been used for {purpose} by local communities for centuries. Respectful geocachers can appreciate its spiritual significance.',
        keywords: ['sacred', 'spiritual', 'religious', 'cultural']
      }
    ]
  },
  {
    category: 'nature',
    templates: [
      {
        title: 'Hidden waterfall near {city}',
        description: 'A spectacular {height}-meter waterfall cascades through {rock_type} rocks, creating a natural wonder perfect for geocaching adventures. Best accessed via {trail_type} trail.',
        keywords: ['waterfall', 'natural', 'hiking', 'scenic']
      },
      {
        title: 'Unique geological formation in {city}',
        description: 'These {formation_type} formations were created over {time_period} through {geological_process}. The area offers excellent opportunities for nature-loving geocachers.',
        keywords: ['geology', 'formation', 'natural', 'unique']
      },
      {
        title: 'Endemic species habitat near {city}',
        description: 'This area is home to the rare {species_name}, found nowhere else in the world. The {habitat_type} ecosystem supports this unique biodiversity.',
        keywords: ['endemic', 'species', 'biodiversity', 'habitat']
      }
    ]
  },
  {
    category: 'mystery',
    templates: [
      {
        title: 'Unexplained phenomena in {city}',
        description: 'Local legends speak of {phenomenon} that occurs {frequency} in this area. While scientists debate the cause, geocachers often report unusual {observations}.',
        keywords: ['mystery', 'unexplained', 'legend', 'phenomena']
      },
      {
        title: 'Lost treasure site near {city}',
        description: 'According to local folklore, {treasure_owner} hid valuable {treasure_type} here during {time_period}. Treasure hunters and geocachers continue the search.',
        keywords: ['treasure', 'lost', 'folklore', 'hunt']
      },
      {
        title: 'Mysterious symbols in {city}',
        description: 'Ancient symbols carved into {surface} remain undeciphered. These {symbol_count} markings may hold the key to understanding {mystery_aspect} of local history.',
        keywords: ['symbols', 'mystery', 'ancient', 'undeciphered']
      }
    ]
  }
];

// Random data generators for fact variation
const randomData = {
  years: [500, 800, 1000, 1200, 1500, 2000, 2500, 3000],
  landmarks: ['the old market square', 'the ancient temple', 'the city walls', 'the royal palace', 'the main cathedral'],
  civilizations: ['Roman Empire', 'Byzantine Empire', 'Ottoman Empire', 'Moorish culture', 'Celtic tribes', 'Viking settlements'],
  armies: ['Roman legions', 'Celtic warriors', 'Viking raiders', 'Ottoman forces', 'Crusader knights', 'Local militia'],
  eras: ['medieval times', 'the Renaissance', 'the Industrial Revolution', 'World War era', 'colonial period'],
  purposes: ['smuggling routes', 'escape passages', 'storage tunnels', 'defensive networks', 'religious processions'],
  crafts: ['pottery', 'weaving', 'metalworking', 'woodcarving', 'glassblowing', 'jewelry making'],
  generations: [3, 4, 5, 6, 7, 8, 10, 12],
  seasons: ['spring', 'summer', 'autumn', 'winter'],
  festivals: ['Harvest', 'Spring Equinox', 'Cultural Heritage', 'Arts and Music', 'Traditional Foods'],
  heights: [15, 25, 35, 50, 75, 100, 150],
  rockTypes: ['limestone', 'granite', 'sandstone', 'basalt', 'quartzite'],
  trailTypes: ['hiking', 'nature', 'adventure', 'forest', 'mountain'],
  formations: ['cave', 'arch', 'pillar', 'canyon', 'mesa'],
  timePeriods: ['millions of years', 'thousands of years', 'centuries', 'geological ages'],
  processes: ['erosion', 'volcanic activity', 'tectonic movement', 'water action', 'wind carving'],
  species: ['endemic bird', 'rare butterfly', 'unique plant', 'special fish', 'local mammal'],
  habitats: ['forest', 'wetland', 'mountainous', 'coastal', 'desert'],
  phenomena: ['strange lights', 'unusual sounds', 'magnetic anomalies', 'temperature variations'],
  frequencies: ['annually', 'seasonally', 'during full moons', 'at sunset', 'randomly'],
  observations: ['compass deviations', 'electrical interference', 'unusual wildlife behavior', 'acoustic effects'],
  treasures: ['gold coins', 'ancient artifacts', 'precious gems', 'religious relics', 'historical documents'],
  surfaces: ['rock faces', 'cave walls', 'stone monuments', 'ancient buildings', 'natural formations'],
  symbolCounts: [5, 7, 12, 15, 20, 25, 33]
};

/**
 * Generate a unique hash for a fact to enable idempotency
 */
function generateFactHash(fact) {
  const content = `${fact.title}|${fact.location_name}|${fact.latitude}|${fact.longitude}`;
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Check if a fact already exists (duplicate detection)
 */
async function checkDuplicateFact(client, fact) {
  if (options.skipDuplicateCheck) {
    return false;
  }

  const factHash = generateFactHash(fact);
  
  // Check by hash first (exact duplicate)
  const { data: hashMatch } = await client
    .from('facts')
    .select('id')
    .eq('title', fact.title)
    .eq('location_name', fact.location_name)
    .limit(1);

  if (hashMatch && hashMatch.length > 0) {
    return true;
  }

  // Check for similar facts by location proximity (within 100m)
  const { data: proximityMatches } = await client
    .from('facts')
    .select('id, title, latitude, longitude')
    .gte('latitude', fact.latitude - 0.001)
    .lte('latitude', fact.latitude + 0.001)
    .gte('longitude', fact.longitude - 0.001)
    .lte('longitude', fact.longitude + 0.001);

  if (proximityMatches && proximityMatches.length > 0) {
    for (const match of proximityMatches) {
      const distance = calculateDistance(
        fact.latitude, fact.longitude,
        match.latitude, match.longitude
      );
      
      if (distance < 0.1) { // Less than 100 meters
        if (options.verbose) {
          console.log(`⚠️  Found nearby fact within ${Math.round(distance * 1000)}m: "${match.title}"`);
        }
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Generate a random fact based on templates and city data
 */
function generateFact(city, region) {
  const categoryData = factTemplates[Math.floor(Math.random() * factTemplates.length)];
  const template = categoryData.templates[Math.floor(Math.random() * categoryData.templates.length)];
  
  let title = template.title.replace('{city}', city.name);
  let description = template.description.replace('{city}', city.name);
  
  // Replace placeholders with random data
  Object.keys(randomData).forEach(key => {
    const placeholder = `{${key}}`;
    if (description.includes(placeholder)) {
      const values = randomData[key];
      const randomValue = values[Math.floor(Math.random() * values.length)];
      description = description.replace(placeholder, randomValue);
    }
  });
  
  // Add some location variation within the city radius
  const radiusKm = city.radiusKm || 10;
  const radiusDeg = radiusKm / 111; // Rough conversion km to degrees
  const randomLat = city.lat + (Math.random() - 0.5) * radiusDeg * 2;
  const randomLng = city.lng + (Math.random() - 0.5) * radiusDeg * 2;
  
  return {
    title: title,
    description: description,
    location_name: `${city.name}, ${city.country}`,
    latitude: parseFloat(randomLat.toFixed(6)),
    longitude: parseFloat(randomLng.toFixed(6)),
    category: categoryData.category,
    media_urls: [],
    status: 'verified' // Pre-verify seeded facts
  };
}

/**
 * Mirror fact data to storage bucket for backup
 */
async function mirrorToStorage(facts, region) {
  if (!options.storageSync) {
    return;
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `seed-backup-${region}-${timestamp}.json`;
    const content = JSON.stringify({ facts, timestamp, region }, null, 2);
    
    const { data, error } = await storage.upload(
      'seed-backups',
      filename,
      Buffer.from(content, 'utf8'),
      { contentType: 'application/json' }
    );

    if (error) {
      console.warn(`⚠️  Storage mirror failed: ${error.message}`);
    } else {
      console.log(`💾 Mirrored ${facts.length} facts to storage: ${filename}`);
    }
  } catch (error) {
    console.warn(`⚠️  Storage mirror error: ${error.message}`);
  }
}

/**
 * Get or create default category
 */
async function ensureCategory(client, categoryName) {
  let { data: category } = await client
    .from('categories')
    .select('id')
    .eq('slug', categoryName)
    .single();

  if (!category) {
    const { data: newCategory } = await client
      .from('categories')
      .insert({
        slug: categoryName,
        icon: getDefaultIconForCategory(categoryName),
        color: getDefaultColorForCategory(categoryName)
      })
      .select('id')
      .single();
    
    category = newCategory;
    console.log(`📦 Created category: ${categoryName}`);
  }

  return category.id;
}

function getDefaultIconForCategory(category) {
  const icons = {
    history: '🏛️',
    culture: '🎭',
    nature: '🌿',
    mystery: '🔍'
  };
  return icons[category] || '📍';
}

function getDefaultColorForCategory(category) {
  const colors = {
    history: '#8B4513',
    culture: '#FF6B6B',
    nature: '#4ECDC4',
    mystery: '#9B59B6'
  };
  return colors[category] || '#6C757D';
}

/**
 * Get default admin user ID
 */
async function getDefaultAuthorId(client) {
  if (options.admin) {
    // Try to find admin user by email if provided
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminUserId = await getUserIdByEmail(adminEmail);
      if (adminUserId) {
        return adminUserId;
      }
    }

    // Fallback: get first admin user
    const { data: adminUsers } = await client
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1);

    if (adminUsers && adminUsers.length > 0) {
      return adminUsers[0].user_id;
    }
  }

  // Fallback: get any user
  const { data: anyUser } = await client
    .from('profiles')
    .select('id')
    .limit(1);

  if (anyUser && anyUser.length > 0) {
    return anyUser[0].id;
  }

  throw new Error('No suitable author user found');
}

/**
 * Main seeding function
 */
async function seedFacts() {
  console.log('🌍 Starting geocacher-friendly facts seeding pipeline...\n');

  if (options.verbose) {
    console.log('Options:', options);
  }

  try {
    const client = getAdminClient();
    
    // Determine which regions to process
    const regionsToProcess = options.region 
      ? [options.region]
      : Object.keys(citiesData.regions);

    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const regionName of regionsToProcess) {
      console.log(`\n🗺️  Processing region: ${regionName}`);
      
      const cities = citiesData.regions[regionName];
      if (!cities) {
        console.warn(`⚠️  Region '${regionName}' not found in cities data`);
        continue;
      }

      const factsToInsert = [];
      let regionProcessed = 0;
      let regionSkipped = 0;

      // Get default author ID
      const defaultAuthorId = await getDefaultAuthorId(client);
      console.log(`👤 Using author ID: ${defaultAuthorId}`);

      for (const city of cities) {
        if (options.limit && regionProcessed >= options.limit) {
          break;
        }

        const factsPerCity = Math.floor(Math.random() * 3) + 2; // 2-4 facts per city
        
        for (let i = 0; i < factsPerCity; i++) {
          const fact = generateFact(city, regionName);
          
          // Check for duplicates
          const isDuplicate = await checkDuplicateFact(client, fact);
          if (isDuplicate) {
            regionSkipped++;
            if (options.verbose) {
              console.log(`⏭️  Skipped duplicate: "${fact.title}"`);
            }
            continue;
          }

          // Get category ID
          const categoryId = await ensureCategory(client, fact.category);
          
          // Prepare fact for insertion
          const factData = {
            ...fact,
            category_id: categoryId,
            author_id: defaultAuthorId
          };

          delete factData.category;
          factsToInsert.push(factData);
          regionProcessed++;

          if (options.verbose) {
            console.log(`✅ Generated: "${fact.title}" in ${fact.location_name}`);
          }
        }
      }

      console.log(`\n📊 Region ${regionName} Summary:`);
      console.log(`   Generated: ${factsToInsert.length} facts`);
      console.log(`   Skipped duplicates: ${regionSkipped}`);

      // Mirror to storage before inserting
      await mirrorToStorage(factsToInsert, regionName);

      if (!options.dryRun && factsToInsert.length > 0) {
        console.log(`\n💾 Inserting ${factsToInsert.length} facts into database...`);

        try {
          const { data, error } = await client
            .from('facts')
            .insert(factsToInsert)
            .select('id');

          if (error) {
            console.error(`❌ Database insertion error for ${regionName}:`, error);
            totalErrors += factsToInsert.length;
          } else {
            console.log(`✅ Successfully inserted ${data.length} facts for ${regionName}`);
            totalProcessed += data.length;
          }
        } catch (insertError) {
          console.error(`❌ Failed to insert facts for ${regionName}:`, insertError.message);
          totalErrors += factsToInsert.length;
        }
      } else if (options.dryRun) {
        console.log(`🔍 DRY RUN: Would insert ${factsToInsert.length} facts`);
        totalProcessed += factsToInsert.length;
      }

      totalSkipped += regionSkipped;
    }

    // Final summary
    console.log('\n🎉 Seeding pipeline completed!');
    console.log(`📈 Total Summary:`);
    console.log(`   Processed: ${totalProcessed} facts`);
    console.log(`   Skipped: ${totalSkipped} duplicates`);
    console.log(`   Errors: ${totalErrors} failures`);

    if (options.dryRun) {
      console.log('\n💡 This was a dry run. Use without --dry-run to actually insert data.');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
🗺️  Geocacher-Friendly Facts Seeding Pipeline

Usage: node seed-geocache-facts.js [options]

Options:
  --admin                  Use admin privileges for seeding
  --dry-run               Preview what would be done without making changes
  --region=<name>         Process only specific region (Europe, Africa, Americas, Asia, Oceania)
  --limit=<number>        Limit number of facts per region
  --verbose, -v           Show detailed logging
  --storage-sync          Enable storage mirroring/backup
  --skip-duplicate-check  Skip duplicate detection (faster but may create duplicates)

Environment Variables Required:
  SUPABASE_URL            Your Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY  Your Supabase service role key
  ADMIN_EMAIL             Admin user email (optional, for --admin mode)

Examples:
  node seed-geocache-facts.js --admin --verbose
  node seed-geocache-facts.js --region=Europe --limit=50 --storage-sync
  node seed-geocache-facts.js --dry-run --verbose
`);
}

// Main execution
if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

seedFacts().catch(console.error);