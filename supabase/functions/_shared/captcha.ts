// CAPTCHA verification for Supabase Edge Functions
// Supports both hCaptcha and reCAPTCHA

interface CaptchaVerificationResult {
  success: boolean;
  error?: string;
  score?: number; // For reCAPTCHA v3
}

/**
 * Verify hCaptcha token
 */
async function verifyHCaptcha(
  token: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  const secret = Deno.env.get("HCAPTCHA_SECRET_KEY");

  if (!secret) {
    console.error("HCAPTCHA_SECRET_KEY not configured");
    return {
      success: false,
      error: "CAPTCHA not configured",
    };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return {
      success: data.success === true,
      error: data.success
        ? undefined
        : data["error-codes"]?.join(", ") || "Verification failed",
    };
  } catch (error) {
    console.error("hCaptcha verification error:", error);
    return {
      success: false,
      error: "CAPTCHA verification failed",
    };
  }
}

/**
 * Verify reCAPTCHA token (v2 or v3)
 */
async function verifyRecaptcha(
  token: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  const secret = Deno.env.get("RECAPTCHA_SECRET_KEY");

  if (!secret) {
    console.error("RECAPTCHA_SECRET_KEY not configured");
    return {
      success: false,
      error: "CAPTCHA not configured",
    };
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      }
    );

    const data = await response.json();

    // For reCAPTCHA v3, check score threshold (0.0 - 1.0)
    const minScore = parseFloat(Deno.env.get("RECAPTCHA_MIN_SCORE") || "0.5");
    const score = data.score;

    if (score !== undefined) {
      return {
        success: data.success && score >= minScore,
        score,
        error: data.success
          ? score < minScore
            ? `Score too low: ${score}`
            : undefined
          : data["error-codes"]?.join(", ") || "Verification failed",
      };
    }

    return {
      success: data.success === true,
      error: data.success
        ? undefined
        : data["error-codes"]?.join(", ") || "Verification failed",
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      error: "CAPTCHA verification failed",
    };
  }
}

/**
 * Verify CAPTCHA token (auto-detects provider)
 */
export async function verifyCaptcha(
  token: string,
  remoteIp?: string
): Promise<CaptchaVerificationResult> {
  // Determine which provider to use based on environment variables
  const provider = Deno.env.get("CAPTCHA_PROVIDER") || "hcaptcha";

  if (provider === "recaptcha") {
    return verifyRecaptcha(token, remoteIp);
  } else {
    return verifyHCaptcha(token, remoteIp);
  }
}

/**
 * Extract IP from request headers
 */
export function getRemoteIp(req: Request): string | undefined {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  return (
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(",")[0].trim() : undefined)
  );
}

/**
 * Middleware to require CAPTCHA verification
 */
export function requireCaptcha(
  handler: (req: Request) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    // Skip CAPTCHA in development mode if configured
    if (Deno.env.get("SKIP_CAPTCHA") === "true") {
      return handler(req);
    }

    try {
      const body = await req.json();
      const captchaToken = body.captchaToken || body.captcha_token;

      if (!captchaToken) {
        return new Response(
          JSON.stringify({
            error: "CAPTCHA token required",
            message: "Please complete the CAPTCHA verification",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const remoteIp = getRemoteIp(req);
      const result = await verifyCaptcha(captchaToken, remoteIp);

      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: "CAPTCHA verification failed",
            message: result.error || "Please try again",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // CAPTCHA verified, proceed with original request
      // Reconstruct request with original body
      const newReq = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(body),
      });

      return handler(newReq);
    } catch (error) {
      console.error("CAPTCHA middleware error:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          message: "Failed to process request",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}
