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

  try {
    const { title, description, category } = await req.json();

    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) {
      throw new Error("OpenAI API key not configured");
    }

    const prompt = `You are a lore expert helping improve historical and cultural submissions. 

Title: ${title}
Description: ${description}
Category: ${category}

Please provide suggestions to improve this lore submission in the following format:
1. Title suggestions (if needed)
2. Content improvements
3. Historical accuracy checks
4. Additional context that could be added

Keep suggestions concise and constructive.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides constructive feedback on historical and cultural content submissions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestions");
    }

    const data = await response.json();
    const suggestions = data.choices[0]?.message?.content || "No suggestions available.";

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});