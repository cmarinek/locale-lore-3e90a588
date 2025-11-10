import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Process Account Deletions Edge Function
 * 
 * This function processes account deletion requests that have passed their 30-day grace period.
 * Should be triggered daily via cron job.
 * 
 * Process:
 * 1. Find deletion requests with status 'pending' and scheduled_deletion <= now()
 * 2. For each user:
 *    - Delete user data from all tables
 *    - Delete auth user
 *    - Update deletion request status to 'completed'
 */
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
    console.log("Starting account deletion processing...");

    // Find all pending deletions that are due
    const { data: pendingDeletions, error: fetchError } = await supabaseClient
      .from("account_deletion_requests")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_deletion", new Date().toISOString());

    if (fetchError) throw fetchError;

    console.log(`Found ${pendingDeletions?.length || 0} accounts to delete`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ user_id: string; error: string }>,
    };

    for (const deletion of pendingDeletions || []) {
      results.processed++;
      
      try {
        console.log(`Processing deletion for user: ${deletion.user_id}`);

        // Delete user data from all tables in order (respecting foreign keys)
        const deleteOperations = [
          // User activity and engagement
          { table: "fact_reactions", column: "user_id" },
          { table: "fact_shares", column: "user_id" },
          { table: "comment_votes", column: "user_id" },
          { table: "votes", column: "user_id" },
          { table: "likes", column: "user_id" },
          
          // User content
          { table: "fact_comments", column: "author_id" },
          { table: "comments", column: "author_id" },
          { table: "facts", column: "author_id" },
          { table: "lore_submissions", column: "user_id" },
          
          // User social
          { table: "user_follows", column: "follower_id" },
          { table: "user_follows", column: "following_id" },
          { table: "direct_messages", column: "sender_id" },
          { table: "direct_messages", column: "recipient_id" },
          
          // User preferences and data
          { table: "user_achievements", column: "user_id" },
          { table: "user_statistics", column: "user_id" },
          { table: "user_settings", column: "user_id" },
          { table: "profiles", column: "id" },
          
          // User management
          { table: "location_claims", column: "user_id" },
          { table: "location_qr_codes", column: "created_by" },
          { table: "ai_recommendations", column: "user_id" },
          { table: "enhanced_notifications", column: "user_id" },
          { table: "data_export_requests", column: "user_id" },
          { table: "user_levels", column: "user_id" },
        ];

        // Execute deletions
        for (const op of deleteOperations) {
          const { error } = await supabaseClient
            .from(op.table)
            .delete()
            .eq(op.column, deletion.user_id);
          
          if (error) {
            console.error(`Error deleting from ${op.table}:`, error);
            // Continue with other deletions even if one fails
          }
        }

        // Delete the auth user (this will cascade to any remaining auth-related data)
        const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(
          deletion.user_id
        );

        if (authDeleteError) {
          throw new Error(`Failed to delete auth user: ${authDeleteError.message}`);
        }

        // Mark deletion as completed
        await supabaseClient
          .from("account_deletion_requests")
          .update({ 
            status: "completed",
            scheduled_deletion: new Date().toISOString() 
          })
          .eq("id", deletion.id);

        results.succeeded++;
        console.log(`Successfully deleted account: ${deletion.user_id}`);

      } catch (error: any) {
        results.failed++;
        const errorMsg = error.message || String(error);
        results.errors.push({ user_id: deletion.user_id, error: errorMsg });
        console.error(`Failed to delete account ${deletion.user_id}:`, errorMsg);
        
        // Mark deletion as failed
        await supabaseClient
          .from("account_deletion_requests")
          .update({ 
            status: "failed",
            feedback: `Deletion failed: ${errorMsg}`
          })
          .eq("id", deletion.id);
      }
    }

    console.log("Account deletion processing complete:", results);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        processed: results.processed,
        succeeded: results.succeeded,
        failed: results.failed,
      },
      errors: results.errors,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in process-account-deletions:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
