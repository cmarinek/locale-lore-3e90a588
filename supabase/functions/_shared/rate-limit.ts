// Rate limiting middleware for Supabase Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix: string; // Prefix for rate limit keys
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const key = `${config.keyPrefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Get or create rate limit record
    const { data: existing, error: selectError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("key", key)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // Error other than "not found"
      console.error("Rate limit check error:", selectError);
      // Fail open - allow request on error to avoid blocking legitimate traffic
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    let count = 1;
    let resetAt = now + config.windowMs;

    if (existing) {
      // Check if window has expired
      if (existing.reset_at < now) {
        // Window expired, reset counter
        count = 1;
        resetAt = now + config.windowMs;
      } else {
        // Within window, increment counter
        count = existing.count + 1;
        resetAt = existing.reset_at;
      }

      // Update record
      const { error: updateError } = await supabase
        .from("rate_limits")
        .update({
          count,
          reset_at: resetAt,
          last_request_at: now,
        })
        .eq("key", key);

      if (updateError) {
        console.error("Rate limit update error:", updateError);
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("rate_limits")
        .insert({
          key,
          count: 1,
          reset_at: resetAt,
          last_request_at: now,
        });

      if (insertError) {
        console.error("Rate limit insert error:", insertError);
      }
    }

    const allowed = count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count);
    const retryAfter = allowed ? undefined : Math.ceil((resetAt - now) / 1000);

    return {
      allowed,
      remaining,
      resetAt,
      retryAfter,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from various headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  const ip =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown");

  return `ip:${ip}`;
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (req: Request): Promise<Response> => {
    // Get user ID from Authorization header if present
    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );
        const {
          data: { user },
        } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        userId = user?.id;
      } catch {
        // Ignore auth errors for rate limiting purposes
      }
    }

    const identifier = getClientIdentifier(req, userId);
    const result = await checkRateLimit(identifier, config);

    // Add rate limit headers to response
    const addRateLimitHeaders = (response: Response): Response => {
      const headers = new Headers(response.headers);
      headers.set("X-RateLimit-Limit", config.maxRequests.toString());
      headers.set("X-RateLimit-Remaining", result.remaining.toString());
      headers.set(
        "X-RateLimit-Reset",
        Math.floor(result.resetAt / 1000).toString()
      );

      if (result.retryAfter) {
        headers.set("Retry-After", result.retryAfter.toString());
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    };

    if (!result.allowed) {
      const response = new Response(
        JSON.stringify({
          error: "Too many requests",
          message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
            "Retry-After": result.retryAfter?.toString() || "60",
          },
        }
      );

      return response;
    }

    // Call the actual handler
    const response = await handler(req);
    return addRateLimitHeaders(response);
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Very strict - for auth endpoints
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "auth",
  },
  // Strict - for content creation
  CREATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: "create",
  },
  // Moderate - for general API use
  STANDARD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: "api",
  },
  // Lenient - for read operations
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
    keyPrefix: "read",
  },
  // Webhook specific
  WEBHOOK: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    keyPrefix: "webhook",
  },
};
