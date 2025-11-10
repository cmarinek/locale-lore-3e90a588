import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log(`Starting data export for user: ${user.id}`);

    // Create export request record
    const { data: exportRequest, error: createError } = await supabaseClient
      .from("data_export_requests")
      .insert({
        user_id: user.id,
        status: "processing",
        export_type: "full"
      })
      .select()
      .single();

    if (createError) throw createError;

    // Collect comprehensive user data from all relevant tables
    const userData_export: any = {
      user_info: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        export_date: new Date().toISOString(),
      },
      export_metadata: {
        version: "1.0",
        exported_at: new Date().toISOString(),
        data_types: [],
      }
    };

    // Fetch profile data
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      userData_export.profile = profile;
      userData_export.export_metadata.data_types.push("profile");
    }

    // Fetch user settings
    const { data: settings } = await supabaseClient
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (settings) {
      userData_export.settings = settings;
      userData_export.export_metadata.data_types.push("settings");
    }

    // Fetch user statistics
    const { data: statistics } = await supabaseClient
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (statistics) {
      userData_export.statistics = statistics;
      userData_export.export_metadata.data_types.push("statistics");
    }

    // Fetch user levels
    const { data: levels } = await supabaseClient
      .from("user_levels")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (levels) {
      userData_export.levels = levels;
      userData_export.export_metadata.data_types.push("levels");
    }

    // Fetch facts submitted by user
    const { data: facts } = await supabaseClient
      .from("facts")
      .select("*")
      .eq("author_id", user.id);
    if (facts && facts.length > 0) {
      userData_export.facts = facts;
      userData_export.export_metadata.data_types.push("facts");
    }

    // Fetch comments made by user
    const { data: comments } = await supabaseClient
      .from("comments")
      .select("*")
      .eq("author_id", user.id);
    if (comments && comments.length > 0) {
      userData_export.comments = comments;
      userData_export.export_metadata.data_types.push("comments");
    }

    // Fetch fact comments
    const { data: factComments } = await supabaseClient
      .from("fact_comments")
      .select("*")
      .eq("author_id", user.id);
    if (factComments && factComments.length > 0) {
      userData_export.fact_comments = factComments;
      userData_export.export_metadata.data_types.push("fact_comments");
    }

    // Fetch likes/votes
    const { data: likes } = await supabaseClient
      .from("likes")
      .select("*")
      .eq("user_id", user.id);
    if (likes && likes.length > 0) {
      userData_export.likes = likes;
      userData_export.export_metadata.data_types.push("likes");
    }

    // Fetch user achievements
    const { data: achievements } = await supabaseClient
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);
    if (achievements && achievements.length > 0) {
      userData_export.achievements = achievements;
      userData_export.export_metadata.data_types.push("achievements");
    }

    // Fetch social connections
    const { data: following } = await supabaseClient
      .from("user_follows")
      .select("*")
      .eq("follower_id", user.id);
    if (following && following.length > 0) {
      userData_export.following = following;
      userData_export.export_metadata.data_types.push("following");
    }

    // Fetch fact reactions
    const { data: reactions } = await supabaseClient
      .from("fact_reactions")
      .select("*")
      .eq("user_id", user.id);
    if (reactions && reactions.length > 0) {
      userData_export.reactions = reactions;
      userData_export.export_metadata.data_types.push("reactions");
    }

    // Create JSON blob
    const exportData = JSON.stringify(userData_export, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    
    // For a real implementation, you would upload this to storage
    // For now, we'll return a base64 encoded version
    const arrayBuffer = await blob.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // Update export request with completion
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await supabaseClient
      .from("data_export_requests")
      .update({
        status: "completed",
        file_url: `data:application/json;base64,${base64Data}`,
        expires_at: expiresAt.toISOString(),
        completed_at: new Date().toISOString()
      })
      .eq("id", exportRequest.id);

    console.log(`Data export completed for user: ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      download_url: `data:application/json;base64,${base64Data}`,
      expires_at: expiresAt.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in export-user-data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});