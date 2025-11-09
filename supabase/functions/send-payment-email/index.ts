import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: 'payment_success' | 'payment_failed' | 'subscription_renewed' | 'subscription_cancelled' | 'payment_method_updated';
  data?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data }: EmailRequest = await req.json();

    const emailHtml = generateEmailHtml(type, data);

    const emailResponse = await resend.emails.send({
      from: "GeoCache Lore <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

function generateEmailHtml(type: string, data: any): string {
  const baseStyles = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
      .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
  `;

  switch (type) {
    case 'payment_success':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Payment Successful! 🎉</h1>
          </div>
          <div class="content">
            <p>Thank you for your payment!</p>
            <p>Your payment of <strong>${data?.amount}</strong> has been processed successfully.</p>
            <p>You can view your invoice and payment details in your account settings.</p>
            <a href="${data?.dashboardUrl || 'https://your-app.com/settings'}" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;

    case 'payment_failed':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <h1>Payment Failed</h1>
          </div>
          <div class="content">
            <p>We encountered an issue processing your payment.</p>
            <p><strong>Reason:</strong> ${data?.reason || 'Payment declined'}</p>
            <p>Please update your payment method to continue enjoying your subscription.</p>
            <a href="${data?.updateUrl || 'https://your-app.com/settings'}" class="button">Update Payment Method</a>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;

    case 'subscription_renewed':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Subscription Renewed ✨</h1>
          </div>
          <div class="content">
            <p>Your subscription has been successfully renewed!</p>
            <p>Thank you for continuing to support GeoCache Lore.</p>
            <p><strong>Next billing date:</strong> ${data?.nextBillingDate || 'N/A'}</p>
            <a href="${data?.dashboardUrl || 'https://your-app.com/settings'}" class="button">Manage Subscription</a>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;

    case 'subscription_cancelled':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
            <h1>Subscription Cancelled</h1>
          </div>
          <div class="content">
            <p>We're sorry to see you go!</p>
            <p>Your subscription has been cancelled and will remain active until <strong>${data?.endDate || 'the end of the billing period'}</strong>.</p>
            <p>You can reactivate your subscription anytime before it expires.</p>
            <a href="${data?.reactivateUrl || 'https://your-app.com/settings'}" class="button">Reactivate Subscription</a>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;

    case 'payment_method_updated':
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>Payment Method Updated 💳</h1>
          </div>
          <div class="content">
            <p>Your payment method has been successfully updated!</p>
            <p>Your subscription will continue without interruption.</p>
            <p><strong>New payment method:</strong> ${data?.paymentMethod || 'Card ending in ****'}</p>
            <a href="${data?.dashboardUrl || 'https://your-app.com/settings'}" class="button">View Settings</a>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;

    default:
      return `
        ${baseStyles}
        <div class="container">
          <div class="header">
            <h1>GeoCache Lore</h1>
          </div>
          <div class="content">
            <p>Thank you for being a valued member!</p>
          </div>
          <div class="footer">
            <p>GeoCache Lore - Discover Historical Facts</p>
          </div>
        </div>
      `;
  }
}
