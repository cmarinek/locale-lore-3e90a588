import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AchievementCriteria {
  slug: string;
  checkFunction: (stats: UserStats) => boolean;
}

interface UserStats {
  facts_submitted: number;
  votes_cast: number;
  comments_made: number;
  current_streak: number;
  total_points: number;
  locations_visited: number;
  max_fact_likes: number;
  historical_facts_count: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, eventType } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking achievements for user ${userId} after event: ${eventType}`);

    const newAchievements = await checkAndAwardAchievements(supabase, userId, eventType);

    return new Response(
      JSON.stringify({ 
        success: true, 
        newAchievements,
        message: `Checked achievements for ${eventType} event`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-achievements:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkAndAwardAchievements(
  supabase: any,
  userId: string,
  eventType: string
): Promise<any[]> {
  // 1. Gather user statistics
  const userStats = await gatherUserStats(supabase, userId);
  
  console.log('User stats:', userStats);

  // 2. Define achievement criteria
  const achievementCriteria: AchievementCriteria[] = [
    {
      slug: 'first-discovery',
      checkFunction: (stats) => stats.facts_submitted >= 1,
    },
    {
      slug: 'explorer',
      checkFunction: (stats) => stats.locations_visited >= 10,
    },
    {
      slug: 'storyteller',
      checkFunction: (stats) => stats.max_fact_likes >= 50,
    },
    {
      slug: 'historian',
      checkFunction: (stats) => stats.historical_facts_count >= 5,
    },
    {
      slug: 'rising-star',
      checkFunction: (stats) => stats.total_points >= 100,
    },
    {
      slug: 'legendary-contributor',
      checkFunction: (stats) => stats.total_points >= 1000,
    },
    {
      slug: 'social-butterfly',
      checkFunction: (stats) => stats.comments_made >= 25,
    },
    {
      slug: 'fact-checker',
      checkFunction: (stats) => stats.votes_cast >= 50,
    },
    {
      slug: 'streak-master',
      checkFunction: (stats) => stats.current_streak >= 7,
    },
  ];

  // 3. Get all achievements from database
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*');

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError);
    throw achievementsError;
  }

  // 4. Get user's already earned achievements
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  if (earnedError) {
    console.error('Error fetching earned achievements:', earnedError);
    throw earnedError;
  }

  const earnedAchievementIds = new Set(
    earnedAchievements?.map((a: any) => a.achievement_id) || []
  );

  // 5. Check which achievements should be unlocked
  const newlyUnlocked: any[] = [];

  for (const criteria of achievementCriteria) {
    const achievement = allAchievements?.find((a: any) => a.slug === criteria.slug);
    
    if (!achievement) {
      console.warn(`Achievement with slug "${criteria.slug}" not found in database`);
      continue;
    }

    // Skip if already earned
    if (earnedAchievementIds.has(achievement.id)) {
      continue;
    }

    // Check if criteria met
    if (criteria.checkFunction(userStats)) {
      console.log(`Unlocking achievement: ${achievement.name}`);
      
      // Award the achievement
      const awarded = await awardAchievement(supabase, userId, achievement);
      if (awarded) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

async function gatherUserStats(supabase: any, userId: string): Promise<UserStats> {
  // Get user statistics
  const { data: stats } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get total points from user_levels
  const { data: levels } = await supabase
    .from('user_levels')
    .select('total_xp')
    .eq('user_id', userId)
    .single();

  // Count distinct locations visited (from facts submitted)
  const { data: locations } = await supabase
    .from('facts')
    .select('latitude, longitude')
    .eq('author_id', userId);

  const uniqueLocations = new Set(
    locations?.map((l: any) => `${l.latitude},${l.longitude}`) || []
  );

  // Get max likes on any single fact
  const { data: factsWithLikes } = await supabase
    .from('facts')
    .select('vote_count_up')
    .eq('author_id', userId)
    .order('vote_count_up', { ascending: false })
    .limit(1);

  const maxLikes = factsWithLikes?.[0]?.vote_count_up || 0;

  // Count historical facts (assuming there's a historical category)
  const { data: historicalCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'historical')
    .single();

  let historicalCount = 0;
  if (historicalCategory) {
    const { count } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('category_id', historicalCategory.id);
    
    historicalCount = count || 0;
  }

  return {
    facts_submitted: stats?.facts_submitted || 0,
    votes_cast: stats?.votes_cast || 0,
    comments_made: stats?.comments_made || 0,
    current_streak: stats?.current_streak || 0,
    total_points: levels?.total_xp || 0,
    locations_visited: uniqueLocations.size,
    max_fact_likes: maxLikes,
    historical_facts_count: historicalCount,
  };
}

async function awardAchievement(
  supabase: any,
  userId: string,
  achievement: any
): Promise<boolean> {
  try {
    // 1. Create user_achievement record
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id,
        earned_at: new Date().toISOString(),
      });

    if (insertError) {
      // Check if it's a duplicate key error (already exists)
      if (insertError.code === '23505') {
        console.log(`Achievement ${achievement.name} already earned by user`);
        return false;
      }
      throw insertError;
    }

    // 2. Award XP bonus (50 XP per achievement)
    const xpBonus = 50;
    const { data: currentLevel } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (currentLevel) {
      await supabase
        .from('user_levels')
        .update({
          current_xp: currentLevel.current_xp + xpBonus,
          total_xp: currentLevel.total_xp + xpBonus,
        })
        .eq('user_id', userId);
    }

    // 3. Update user statistics total points
    const { data: currentStats } = await supabase
      .from('user_statistics')
      .select('total_points')
      .eq('user_id', userId)
      .single();

    if (currentStats) {
      await supabase
        .from('user_statistics')
        .update({
          total_points: (currentStats.total_points || 0) + xpBonus,
        })
        .eq('user_id', userId);
    }

    // 4. Create notification
    await supabase
      .from('enhanced_notifications')
      .insert({
        user_id: userId,
        type: 'achievement_unlocked',
        category: 'gamification',
        title: '🏆 Achievement Unlocked!',
        body: `You've earned the "${achievement.name}" achievement! +${xpBonus} XP`,
        priority: 'high',
        data: {
          achievement_id: achievement.id,
          achievement_name: achievement.name,
          xp_earned: xpBonus,
        },
        status: 'pending',
      });

    console.log(`Successfully awarded ${achievement.name} to user ${userId}`);
    return true;

  } catch (error) {
    console.error(`Error awarding achievement ${achievement.name}:`, error);
    return false;
  }
}
