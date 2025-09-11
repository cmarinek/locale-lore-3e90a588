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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    
    console.log('Fact acquisition action:', action, params);

    switch (action) {
      case 'create_job':
        return await createJob(supabase, params);
      case 'start_job':
        return await startJob(supabase, params);
      case 'pause_job':
        return await pauseJob(supabase, params);
      case 'resume_job':
        return await resumeJob(supabase, params);
      case 'cancel_job':
        return await cancelJob(supabase, params);
      case 'get_jobs':
        return await getJobs(supabase, params);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in fact-acquisition function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Fact acquisition failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createJob(supabase: any, params: any) {
  const { 
    name, 
    target_count = 100, 
    configuration = {} 
  } = params;

  if (!name) {
    throw new Error('Job name is required');
  }

  const { data: job, error } = await supabase
    .from('acquisition_jobs')
    .insert({
      name,
      source_type: 'wikipedia',
      target_count,
      configuration: {
        categories: configuration.categories || ['history', 'science', 'culture', 'geography', 'nature'],
        include_images: configuration.include_images !== false,
        require_coordinates: configuration.require_coordinates !== false,
        quality_filter: configuration.quality_filter !== false,
        ...configuration
      },
      created_by: null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  console.log('Created acquisition job:', job.id);

  return new Response(JSON.stringify({ 
    success: true,
    job: job
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function startJob(supabase: any, params: any) {
  const { jobId } = params;

  if (!jobId) {
    throw new Error('Job ID is required');
  }

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('acquisition_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error('Job not found');
  }

  if (job.status === 'running') {
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Job is already running'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update job status to running
  await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'running',
      progress_data: { started_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  // Start processing in background
  setTimeout(() => processJobInBackground(supabase, job), 100);

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job started successfully',
    jobId: job.id
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function pauseJob(supabase: any, params: any) {
  const { jobId } = params;

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'paused',
      progress_data: { paused_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to pause job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job paused successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resumeJob(supabase: any, params: any) {
  const { jobId } = params;

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('acquisition_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error('Job not found');
  }

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'running',
      progress_data: { resumed_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to resume job: ${error.message}`);
  }

  // Resume processing in background
  setTimeout(() => processJobInBackground(supabase, job), 100);

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job resumed successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cancelJob(supabase: any, params: any) {
  const { jobId } = params;

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'failed',
      progress_data: { cancelled_at: new Date().toISOString() },
      error_log: ['Job cancelled by user']
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job cancelled successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getJobs(supabase: any, params: any) {
  const { limit = 50, offset = 0, status } = params;

  let query = supabase
    .from('acquisition_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: jobs, error } = await query;

  if (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    jobs: jobs || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function processJobInBackground(supabase: any, job: any) {
  console.log('Starting background processing for job:', job.id);
  
  const { categories, target_count, include_images, require_coordinates, quality_filter } = job.configuration;
  const batchSize = 5; // Process fewer items at once to improve reliability
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  try {
    // Generate articles to process
    const articles = await generateArticlesList(categories, target_count);
    console.log(`Generated ${articles.length} articles for processing`);

    for (let i = 0; i < articles.length && processedCount < target_count; i += batchSize) {
      // Check if job is still running
      const { data: currentJob } = await supabase
        .from('acquisition_jobs')
        .select('status')
        .eq('id', job.id)
        .single();

      if (currentJob?.status !== 'running') {
        console.log('Job paused or cancelled, stopping processing');
        break;
      }

      const batch = articles.slice(i, i + batchSize);
      
      for (const article of batch) {
        try {
          const fact = await processWikipediaArticle(article, include_images, require_coordinates, quality_filter);
          
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
                author_id: null, // System-generated facts
                status: 'verified',
                image_url: fact.images?.[0] || null,
                media_urls: fact.images || []
              });

            if (factError) {
              console.error('Failed to insert fact:', factError);
              errorCount++;
            } else {
              successCount++;
              console.log(`Successfully imported: ${fact.title}`);
            }
          } else {
            console.log(`Skipped article: ${article.title} (quality filter)`);
          }
          
          processedCount++;
        } catch (error) {
          console.error(`Failed to process article ${article.title}:`, error);
          errorCount++;
          processedCount++;
        }
      }

      // Update job progress
      await supabase
        .from('acquisition_jobs')
        .update({
          processed_count: processedCount,
          success_count: successCount,
          error_count: errorCount
        })
        .eq('id', job.id);

      // Brief delay between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Mark job as completed
    await supabase
      .from('acquisition_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_count: processedCount,
        success_count: successCount,
        error_count: errorCount
      })
      .eq('id', job.id);

    console.log(`Job ${job.id} completed: ${successCount} successful, ${errorCount} errors`);

  } catch (error) {
    console.error('Background processing error:', error);
    
    // Mark job as failed
    await supabase
      .from('acquisition_jobs')
      .update({ 
        status: 'failed',
        error_log: [error.message],
        processed_count: processedCount,
        success_count: successCount,
        error_count: errorCount
      })
      .eq('id', job.id);
  }
}

async function generateArticlesList(categories: string[], targetCount: number) {
  const articles = [];
  const perCategory = Math.ceil(targetCount / categories.length);
  
  for (const category of categories) {
    try {
      const categoryArticles = await getWikipediaArticles(category, perCategory);
      articles.push(...categoryArticles);
    } catch (error) {
      console.error(`Failed to get articles for category ${category}:`, error);
    }
  }
  
  return articles.slice(0, targetCount);
}

async function getWikipediaArticles(category: string, limit: number) {
  const articles = [];
  let attempts = 0;
  const maxAttempts = limit * 3;
  
  console.log(`Searching for ${limit} articles for category: ${category}`);
  
  while (articles.length < limit && attempts < maxAttempts) {
    attempts++;
    
    try {
      const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
      const data = await response.json();
      
      if (!data.title || !data.extract) {
        continue;
      }
      
      // Skip disambiguation pages, lists, categories, and very short articles
      if (data.title.includes('disambiguation') || 
          data.title.includes('List of') || 
          data.title.includes('Category:') ||
          data.extract.length < 100) {
        continue;
      }
      
      articles.push({
        title: data.title,
        extract: data.extract,
        pageid: data.pageid || attempts
      });
      
      // Brief delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to fetch random article:', error);
    }
  }
  
  console.log(`Found ${articles.length} articles for ${category}`);
  return articles;
}

async function processWikipediaArticle(
  article: any, 
  includeImages: boolean, 
  requireCoordinates: boolean, 
  qualityFilter: boolean
): Promise<WikipediaPage | null> {
  try {
    const title = article.title;
    
    // Get page content
    const pageUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(pageUrl);
    const data = await response.json();
    
    if (!data.extract) {
      return null;
    }

    // Quality filter
    if (qualityFilter && data.extract.length < 200) {
      return null;
    }

    // Get coordinates
    let coordinates = null;
    try {
      const coordUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates&titles=${encodeURIComponent(title)}`;
      const coordResponse = await fetch(coordUrl);
      const coordData = await coordResponse.json();
      
      const pages = coordData.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const coords = pages[pageId]?.coordinates?.[0];
        if (coords && coords.lat && coords.lon) {
          if (coords.lat >= -90 && coords.lat <= 90 && 
              coords.lon >= -180 && coords.lon <= 180) {
            coordinates = { lat: coords.lat, lon: coords.lon };
          }
        }
      }
    } catch (error) {
      console.error('Failed to get coordinates:', error);
    }

    // Skip if coordinates are required but not found
    if (requireCoordinates && !coordinates) {
      return null;
    }

    // If no coordinates, generate random ones (for demo purposes)
    if (!coordinates) {
      coordinates = {
        lat: (Math.random() - 0.5) * 180, // -90 to 90
        lon: (Math.random() - 0.5) * 360  // -180 to 180
      };
    }

    // Get images if requested
    let images = [];
    if (includeImages) {
      images = await getWikimediaImages(title);
    }

    return {
      title: data.title,
      description: data.extract,
      coordinates: coordinates,
      location: data.title,
      extract: data.extract,
      images: images.slice(0, 3),
      category: 'general'
    };
  } catch (error) {
    console.error('Failed to process Wikipedia article:', error);
    return null;
  }
}

async function getWikimediaImages(title: string): Promise<string[]> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&titles=${encodeURIComponent(title)}&imlimit=3`;
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
        
        // Skip SVGs and other non-photo files
        if (imageTitle.includes('.svg') || 
            imageTitle.includes('Commons-logo') || 
            imageTitle.includes('Wikimedia')) {
          continue;
        }
        
        const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=400&titles=${encodeURIComponent(imageTitle)}`;
        const imageResponse = await fetch(imageUrl);
        const imageData = await imageResponse.json();
        
        const imagePages = imageData.query?.pages;
        if (imagePages) {
          const imagePageId = Object.keys(imagePages)[0];
          const imageInfo = imagePages[imagePageId]?.imageinfo?.[0];
          if (imageInfo?.thumburl || imageInfo?.url) {
            imageUrls.push(imageInfo.thumburl || imageInfo.url);
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
  try {
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
      // Return a default category ID or create one
      const { data: defaultCategory } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
        .single();
      return defaultCategory?.id || await createDefaultCategory(supabase);
    }

    return newCategory.id;
  } catch (error) {
    console.error('Error in getOrCreateCategory:', error);
    return await createDefaultCategory(supabase);
  }
}

async function createDefaultCategory(supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: 'general',
      icon: '📍',
      color: '#3B82F6'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create default category:', error);
    return '00000000-0000-0000-0000-000000000000'; // Fallback UUID
  }

  return data.id;
}

function getDefaultCategoryIcon(categoryName: string): string {
  const iconMap: { [key: string]: string } = {
    'history': '🏛️',
    'science': '🔬',
    'culture': '🎭',
    'geography': '🌍',
    'nature': '🌿',
    'technology': '💻',
    'art': '🎨',
    'sports': '⚽',
    'general': '📍'
  };
  return iconMap[categoryName.toLowerCase()] || '📍';
}

function getDefaultCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    'history': '#8B4513',
    'science': '#4169E1',
    'culture': '#9932CC',
    'geography': '#228B22',
    'nature': '#006400',
    'technology': '#4682B4',
    'art': '#FF1493',
    'sports': '#FF4500',
    'general': '#3B82F6'
  };
  return colorMap[categoryName.toLowerCase()] || '#3B82F6';
}