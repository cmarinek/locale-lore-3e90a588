import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlert {
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  findings: Array<{
    id: string;
    category: string;
    details: string;
  }>;
  timestamp: string;
  recipientEmail: string;
  slackWebhook?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const alert: SecurityAlert = await req.json();
    
    console.log("Processing security alert:", alert.severity);

    // Send email notification
    const emailResult = await sendEmailAlert(alert);
    
    // Send Slack notification if webhook provided
    let slackResult = null;
    if (alert.slackWebhook) {
      slackResult = await sendSlackAlert(alert);
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: emailResult,
        slack: slackResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending security alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

async function sendEmailAlert(alert: SecurityAlert) {
  const severityColors = {
    critical: "#DC2626",
    high: "#EA580C",
    medium: "#D97706",
    low: "#65A30D",
  };

  const severityEmojis = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };

  const findingsHtml = alert.findings
    .map(
      (finding) => `
    <div style="margin: 15px 0; padding: 15px; background: #F9FAFB; border-left: 3px solid ${severityColors[alert.severity]}; border-radius: 4px;">
      <strong style="color: #111827;">${finding.category}</strong>
      <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 14px;">${finding.details}</p>
    </div>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: ${severityColors[alert.severity]}; color: white; padding: 30px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
                ${severityEmojis[alert.severity]} Security Alert
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                ${alert.severity.toUpperCase()} Priority
              </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px 20px;">
              <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 20px;">
                ${alert.title}
              </h2>
              <p style="margin: 0 0 20px 0; color: #6B7280; font-size: 16px; line-height: 1.5;">
                ${alert.description}
              </p>
              
              <div style="margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 16px;">
                  Detected Vulnerabilities:
                </h3>
                ${findingsHtml}
              </div>
              
              <div style="margin: 25px 0 0 0; padding: 20px; background: #FEF3C7; border-radius: 6px; border-left: 4px solid #F59E0B;">
                <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                  <strong>⚠️ Action Required:</strong> Please review and remediate these security issues immediately. 
                  Access your security dashboard to view detailed information and apply fixes.
                </p>
              </div>
              
              <div style="margin: 30px 0 0 0; text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL") || "https://mwufulzthoqrwbwtvogx.supabase.co"}" 
                   style="display: inline-block; padding: 12px 30px; background: ${severityColors[alert.severity]}; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  View Security Dashboard
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center;">
              <p style="margin: 0; color: #6B7280; font-size: 12px;">
                Alert generated on ${new Date(alert.timestamp).toLocaleString()}
              </p>
              <p style="margin: 10px 0 0 0; color: #9CA3AF; font-size: 12px;">
                GeoCache Lore Security Monitoring System
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailResponse = await resend.emails.send({
    from: "GeoCache Security <security@resend.dev>",
    to: [alert.recipientEmail],
    subject: `${severityEmojis[alert.severity]} [${alert.severity.toUpperCase()}] Security Alert: ${alert.title}`,
    html,
  });

  console.log("Email sent successfully:", emailResponse);
  return emailResponse;
}

async function sendSlackAlert(alert: SecurityAlert) {
  const severityEmojis = {
    critical: ":red_circle:",
    high: ":large_orange_circle:",
    medium: ":large_yellow_circle:",
    low: ":large_green_circle:",
  };

  const severityColors = {
    critical: "#DC2626",
    high: "#EA580C",
    medium: "#D97706",
    low: "#65A30D",
  };

  const findingsText = alert.findings
    .map((finding) => `• *${finding.category}*\n  ${finding.details}`)
    .join("\n\n");

  const slackPayload = {
    text: `${severityEmojis[alert.severity]} *Security Alert*: ${alert.title}`,
    attachments: [
      {
        color: severityColors[alert.severity],
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${alert.severity.toUpperCase()} Security Alert`,
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${alert.title}*\n${alert.description}`,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Detected Vulnerabilities:*\n${findingsText}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Alert generated: ${new Date(alert.timestamp).toLocaleString()}`,
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Dashboard",
                  emoji: true,
                },
                url: `${Deno.env.get("SUPABASE_URL") || "https://mwufulzthoqrwbwtvogx.supabase.co"}/security-audit`,
                style: "danger",
              },
            ],
          },
        ],
      },
    ],
  };

  const slackResponse = await fetch(alert.slackWebhook!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(slackPayload),
  });

  if (!slackResponse.ok) {
    throw new Error(`Slack webhook failed: ${slackResponse.statusText}`);
  }

  console.log("Slack notification sent successfully");
  return { success: true };
}

serve(handler);
