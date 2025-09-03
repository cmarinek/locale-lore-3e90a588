import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikipediaPage {
  title: string;
  description: string;
  coordinates?: { lat: number; lon: number };
  location?: string;
  extract: string;
  images?: string[];
  category?: string;
}

interface HarvestJob {
  jobId: string;
  categories: string[];
  targetCount: number;
  regions?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    
    console.log('Fact harvester action:', action, params);

    switch (action) {
      case 'start_harvest':
        return await startHarvest(supabase, params);
      case 'process_batch':
        return await processBatch(supabase, params);
      case 'get_status':
        return await getStatus(supabase, params);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in fact-harvester function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Fact harvesting failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function startHarvest(supabase: any, params: HarvestJob) {
  const { jobId, categories, targetCount, regions } = params;

  // Update job status to running
  await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'running',
      progress_data: { started_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  // Generate queue items for Wikipedia content
  const queueItems = await generateWikipediaQueue(categories, targetCount, regions);
  
  // Insert queue items
  const { error: queueError } = await supabase
    .from('acquisition_queue')
    .insert(
      queueItems.map(item => ({
        job_id: jobId,
        item_type: 'fact',
        source_url: item.url,
        source_data: item.data
      }))
    );

  if (queueError) {
    throw new Error(`Failed to create queue: ${queueError.message}`);
  }

  console.log(`Created ${queueItems.length} queue items for job ${jobId}`);

  return new Response(JSON.stringify({ 
    success: true,
    queueSize: queueItems.length,
    message: 'Harvest job started successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processBatch(supabase: any, params: { jobId: string; batchSize?: number }) {
  const { jobId, batchSize = 10 } = params;
  
  // Get pending queue items
  const { data: queueItems, error: queueError } = await supabase
    .from('acquisition_queue')
    .select('*')
    .eq('job_id', jobId)
    .eq('status', 'pending')
    .limit(batchSize);

  if (queueError || !queueItems?.length) {
    return new Response(JSON.stringify({ 
      success: true,
      processed: 0,
      message: 'No pending items to process'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const item of queueItems) {
    try {
      // Mark as processing
      await supabase
        .from('acquisition_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      // Process the Wikipedia page
      const fact = await processWikipediaPage(item.source_data);
      
      if (fact) {
        // Get or create category
        const categoryId = await getOrCreateCategory(supabase, fact.category || 'general');
        
        // Insert fact into database
        const { error: factError } = await supabase
          .from('facts')
          .insert({
            title: fact.title,
            description: fact.description,
            latitude: fact.coordinates.lat,
            longitude: fact.coordinates.lon,
            location_name: fact.location || fact.title,
            category_id: categoryId,
            author_id: '00000000-0000-0000-0000-000000000000', // System user
            status: 'verified',
            media_urls: fact.images || []
          });

        if (factError) {
          console.error('Failed to insert fact:', factError);
          throw factError;
        }

        // Mark as completed
        await supabase
          .from('acquisition_queue')
          .update({ 
            status: 'completed',
            result_data: { fact_id: fact.title, coordinates: fact.coordinates },
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        successCount++;
      } else {
        // Mark as skipped (no coordinates)
        await supabase
          .from('acquisition_queue')
          .update({ 
            status: 'failed',
            error_message: 'No valid coordinates found',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);
        
        skippedCount++;
      }
    } catch (error) {
      console.error(`Failed to process item ${item.id}:`, error);
      
      // Mark as failed
      await supabase
        .from('acquisition_queue')
        .update({ 
          status: 'failed',
          error_message: error.message,
          attempts: item.attempts + 1
        })
        .eq('id', item.id);

      errorCount++;
    }
  }

  // Update job progress
  const { data: job } = await supabase
    .from('acquisition_jobs')
    .select('processed_count, success_count, error_count')
    .eq('id', jobId)
    .single();

  if (job) {
    await supabase
      .from('acquisition_jobs')
      .update({
        processed_count: job.processed_count + queueItems.length,
        success_count: job.success_count + successCount,
        error_count: job.error_count + errorCount
      })
      .eq('id', jobId);
  }

  console.log(`Batch processed: ${successCount} successful, ${errorCount} errors, ${skippedCount} skipped (no coordinates)`);

  return new Response(JSON.stringify({ 
    success: true,
    processed: queueItems.length,
    successCount,
    errorCount,
    skippedCount,
    message: `Processed ${queueItems.length} items: ${successCount} with coordinates, ${skippedCount} skipped`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getStatus(supabase: any, params: { jobId: string }) {
  const { jobId } = params;
  
  const { data: job, error } = await supabase
    .from('acquisition_jobs')
    .select(`
      *,
      queue_stats:acquisition_queue(status)
    `)
    .eq('id', jobId)
    .single();

  if (error) {
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  // Count queue statuses
  const queueStats = job.queue_stats?.reduce((acc: any, item: any) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}) || {};

  return new Response(JSON.stringify({
    ...job,
    queue_stats: queueStats
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateWikipediaQueue(categories: string[], targetCount: number, regions?: string[]) {
  const queueItems = [];
  const perCategory = Math.ceil(targetCount / categories.length);
  
  for (const category of categories) {
    try {
      // Get random articles from category
      const articles = await getWikipediaArticles(category, perCategory);
      
      for (const article of articles) {
        queueItems.push({
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`,
          data: {
            title: article.title,
            category,
            pageid: article.pageid
          }
        });
      }
    } catch (error) {
      console.error(`Failed to get articles for category ${category}:`, error);
    }
  }
  
  return queueItems.slice(0, targetCount);
}

async function getWikipediaArticles(category: string, limit: number) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/random/summary`;
  const articles = [];
  
  // Get random articles - simplified approach
  for (let i = 0; i < limit && i < 50; i++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.title && data.extract) {
        articles.push({
          title: data.title,
          pageid: data.pageid || i,
          extract: data.extract
        });
      }
    } catch (error) {
      console.error('Failed to fetch random article:', error);
    }
  }
  
  return articles;
}

async function processWikipediaPage(sourceData: any): Promise<WikipediaPage | null> {
  try {
    const title = sourceData.title;
    
    // Get page content
    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(pageUrl);
    const data = await response.json();
    
    if (!data.extract) {
      console.log(`Skipping ${title}: No extract available`);
      return null;
    }

    // Get coordinates - REQUIRED, no fallback
    let coordinates;
    try {
      const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=${encodeURIComponent(title)}`;
      const coordResponse = await fetch(coordUrl);
      const coordData = await coordResponse.json();
      
      const pages = coordData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const coords = pages[pageId]?.coordinates?.[0];
        if (coords && coords.lat && coords.lon) {
          // Validate coordinates are within valid ranges
          if (coords.lat >= -90 && coords.lat <= 90 && 
              coords.lon >= -180 && coords.lon <= 180) {
            coordinates = { lat: coords.lat, lon: coords.lon };
          }
        }
      }
    } catch (error) {
      console.error('Failed to get coordinates:', error);
    }

    // Skip if no valid coordinates found
    if (!coordinates) {
      console.log(`Skipping ${title}: No valid coordinates found`);
      return null;
    }

    // Get images from Wikimedia Commons
    const images = await getWikimediaImages(title);

    console.log(`Successfully processed ${title} with coordinates: ${coordinates.lat}, ${coordinates.lon}`);

    return {
      title: data.title,
      description: data.extract,
      coordinates,
      location: data.title, // Use title as location fallback
      extract: data.extract,
      images: images.slice(0, 3), // Limit to 3 images
      category: sourceData.category || 'general'
    };
  } catch (error) {
    console.error('Failed to process Wikipedia page:', error);
    return null;
  }
}

async function getWikimediaImages(title: string): Promise<string[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(title)}&imlimit=5`;
    const response = await fetch(url);
    const data = await response.json();
    
    const pages = data.query?.pages;
    if (!pages) return [];
    
    const pageId = Object.keys(pages)[0];
    const images = pages[pageId]?.images || [];
    
    const imageUrls = [];
    for (const image of images.slice(0, 3)) {
      try {
        const imageTitle = image.title;
        const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=${encodeURIComponent(imageTitle)}`;
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.json();
        
        const imagePages = imageData.query?.pages;
        if (imagePages) {
          const imagePageId = Object.keys(imagePages)[0];
          const imageInfo = imagePages[imagePageId]?.imageinfo?.[0];
          if (imageInfo?.url) {
            imageUrls.push(imageInfo.url);
          }
        }
      } catch (error) {
        console.error('Failed to get image URL:', error);
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Failed to get Wikimedia images:', error);
    return [];
  }
}

async function getOrCreateCategory(supabase: any, categoryName: string): Promise<string> {
  // Try to find existing category
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categoryName.toLowerCase().replace(/\s+/g, '-'))
    .single();

  if (existingCategory) {
    return existingCategory.id;
  }

  // Create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
      icon: getDefaultCategoryIcon(categoryName),
      color: getDefaultCategoryColor(categoryName)
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create category:', error);
    // Return a default category ID
    const { data: defaultCategory } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();
    return defaultCategory?.id || '00000000-0000-0000-0000-000000000000';
  }

  return newCategory.id;
}

function getDefaultCategoryIcon(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    history: '🏛️',
    science: '🔬',
    nature: '🌿',
    culture: '🎭',
    geography: '🌍',
    general: '📝'
  };
  
  const key = Object.keys(iconMap).find(k => categoryName.toLowerCase().includes(k));
  return iconMap[key || 'general'];
}

function getDefaultCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    history: '#8B4513',
    science: '#4169E1',
    nature: '#228B22',
    culture: '#FF69B4',
    geography: '#20B2AA',
    general: '#696969'
  };
  
  const key = Object.keys(colorMap).find(k => categoryName.toLowerCase().includes(k));
  return colorMap[key || 'general'];
}