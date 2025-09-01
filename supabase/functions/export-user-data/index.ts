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

    // Collect user data from various tables
    const userData_export = {
      user_info: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };

    // Fetch profile data
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profile) userData_export.profile = profile;

    // Fetch user settings
    const { data: settings } = await supabaseClient
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (settings) userData_export.settings = settings;

    // Fetch user statistics
    const { data: statistics } = await supabaseClient
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (statistics) userData_export.statistics = statistics;

    // Fetch facts submitted by user
    const { data: facts } = await supabaseClient
      .from("facts")
      .select("*")
      .eq("author_id", user.id);
    if (facts) userData_export.facts = facts;

    // Fetch comments made by user
    const { data: comments } = await supabaseClient
      .from("comments")
      .select("*")
      .eq("author_id", user.id);
    if (comments) userData_export.comments = comments;

    // Fetch votes cast by user
    const { data: votes } = await supabaseClient
      .from("votes")
      .select("*")
      .eq("user_id", user.id);
    if (votes) userData_export.votes = votes;

    // Fetch user achievements
    const { data: achievements } = await supabaseClient
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id);
    if (achievements) userData_export.achievements = achievements;

    // Fetch activity log (last 90 days for privacy)
    const { data: activityLog } = await supabaseClient
      .from("user_activity_log")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
    if (activityLog) userData_export.activity_log = activityLog;

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