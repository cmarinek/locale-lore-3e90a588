import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const RefundPolicy = () => {
  const BUSINESS_NAME = "[YOUR LEGAL ENTITY NAME]"; // e.g., "LocaleLore LLC"
  const SUPPORT_EMAIL = "support@localelore.org"; // ✅ CONFIGURED
  const EFFECTIVE_DATE = "December 1, 2025"; // TODO: Set to launch date

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Legal Notice:</strong> Replace placeholder values in [brackets] with actual business information.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-muted-foreground">
              Effective Date: {EFFECTIVE_DATE}<br />
              Last Updated: {EFFECTIVE_DATE}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <section>
              <h2>1. Overview</h2>
              <p>
                This Refund Policy explains {BUSINESS_NAME}'s policy regarding refunds for LocaleLore
                subscription services and one-time purchases. We are committed to customer satisfaction
                while maintaining fair business practices.
              </p>
            </section>

            <section>
              <h2>2. Subscription Refund Policy</h2>

              <h3>2.1 Subscription Plans</h3>
              <p>Our subscription plans are:</p>
              <ul>
                <li><strong>Basic Plan:</strong> $9.99/month</li>
                <li><strong>Premium Plan:</strong> $19.99/month</li>
                <li><strong>Pro Plan:</strong> $29.99/month</li>
              </ul>

              <h3>2.2 30-Day Money-Back Guarantee</h3>
              <p>
                <strong>First-time subscribers only:</strong> If you're not satisfied with your subscription,
                you can request a full refund within 30 days of your initial purchase, provided:
              </p>
              <ul>
                <li>This is your first subscription to LocaleLore</li>
                <li>You request the refund within 30 days of your first payment</li>
                <li>You have not violated our Terms of Service</li>
                <li>Your account shows reasonable use (not excessive or abusive usage)</li>
              </ul>
              <p>
                <em>Note: This guarantee applies only to your first month's subscription payment.</em>
              </p>

              <h3>2.3 No Partial Month Refunds</h3>
              <p>
                After the 30-day guarantee period, we do not offer refunds for partial billing periods.
                If you cancel your subscription:
              </p>
              <ul>
                <li>You will not be charged for the next billing period</li>
                <li>You retain full access to paid features until the end of your current billing period</li>
                <li>No refund will be issued for the unused portion of the current period</li>
              </ul>

              <h3>2.4 Free Trial Refunds</h3>
              <p>
                If you cancel during your 3-day free trial period, you will not be charged. No refund
                is necessary as no payment was made.
              </p>
            </section>

            <section>
              <h2>3. One-Time Purchase Refunds</h2>

              <h3>3.1 Digital Products</h3>
              <p>One-time purchases (Premium Feature Pack, Advanced Analytics, etc.) are generally non-refundable except:</p>
              <ul>
                <li><strong>Technical Issues:</strong> If the purchased feature does not work as described</li>
                <li><strong>Billing Errors:</strong> If you were charged incorrectly</li>
                <li><strong>Duplicate Charges:</strong> If you were charged multiple times for the same purchase</li>
              </ul>
              <p>
                Refund requests for one-time purchases must be submitted within 14 days of purchase.
              </p>
            </section>

            <section>
              <h2>4. Refund Eligibility - Exceptions</h2>

              <h3>4.1 Technical Issues</h3>
              <p>We may issue refunds if:</p>
              <ul>
                <li>Our Service was unavailable for extended periods (more than 24 consecutive hours) due to our fault</li>
                <li>A critical feature you paid for was non-functional for a significant portion of your billing period</li>
                <li>You experienced data loss due to our system error</li>
              </ul>
              <p>
                <em>Note: Scheduled maintenance and brief downtimes do not qualify for refunds.</em>
              </p>

              <h3>4.2 Billing Errors</h3>
              <p>We will provide a full refund if:</p>
              <ul>
                <li>You were charged incorrectly or more than the stated subscription price</li>
                <li>You were charged multiple times for the same subscription period</li>
                <li>You were charged after successfully canceling your subscription</li>
                <li>You were charged for a subscription you never authorized</li>
              </ul>

              <h3>4.3 Unauthorized Charges</h3>
              <p>
                If you believe your payment method was used without your authorization, contact us
                immediately at {SUPPORT_EMAIL}. We will investigate and issue a refund if warranted.
              </p>
            </section>

            <section>
              <h2>5. Non-Refundable Circumstances</h2>
              <p>Refunds will NOT be issued in the following situations:</p>
              <ul>
                <li><strong>Account Termination for Violations:</strong> If we terminate your account for violating our Terms of Service</li>
                <li><strong>Change of Mind:</strong> After the 30-day guarantee period, "change of mind" is not grounds for refund</li>
                <li><strong>Lack of Use:</strong> Simply not using the Service does not qualify for a refund</li>
                <li><strong>Second Subscriptions:</strong> The 30-day guarantee applies only to first-time subscribers</li>
                <li><strong>Promotional Discounts:</strong> Subscriptions purchased at a discount may have different refund terms (specified at purchase)</li>
                <li><strong>Third-Party Issues:</strong> Issues with third-party services (internet connection, device problems) are not grounds for refund</li>
                <li><strong>Fair Use Violations:</strong> Excessive or abusive use of refund privileges</li>
              </ul>
            </section>

            <section>
              <h2>6. How to Request a Refund</h2>

              <h3>6.1 Refund Request Process</h3>
              <p>To request a refund:</p>
              <ol>
                <li>Email {SUPPORT_EMAIL} with the subject line "Refund Request"</li>
                <li>Include the following information:
                  <ul>
                    <li>Your account email address</li>
                    <li>The date of your charge</li>
                    <li>The amount charged</li>
                    <li>Reason for your refund request</li>
                    <li>Any relevant screenshots or documentation</li>
                  </ul>
                </li>
                <li>Our support team will review your request within 3-5 business days</li>
                <li>You will receive an email with our decision</li>
              </ol>

              <h3>6.2 Review Timeline</h3>
              <ul>
                <li><strong>Initial Response:</strong> Within 24-48 hours</li>
                <li><strong>Decision:</strong> Within 3-5 business days</li>
                <li><strong>Refund Processing:</strong> 5-10 business days after approval</li>
              </ul>

              <h3>6.3 Required Information</h3>
              <p>
                To expedite your refund request, please provide as much detail as possible about why
                you're requesting a refund. Incomplete requests may be delayed while we gather additional
                information.
              </p>
            </section>

            <section>
              <h2>7. Refund Method and Timing</h2>

              <h3>7.1 Refund Method</h3>
              <p>
                Approved refunds will be issued to the original payment method used for the purchase.
                We cannot issue refunds to different payment methods or accounts.
              </p>

              <h3>7.2 Processing Time</h3>
              <ul>
                <li><strong>Credit/Debit Cards:</strong> 5-10 business days</li>
                <li><strong>PayPal:</strong> 3-5 business days</li>
                <li><strong>Other Payment Methods:</strong> As determined by the payment processor</li>
              </ul>
              <p>
                <em>Note: The refund timeline depends on your financial institution's processing time.
                We initiate refunds promptly, but we cannot control how quickly your bank processes them.</em>
              </p>

              <h3>7.3 Refund Confirmation</h3>
              <p>
                You will receive an email confirmation when your refund is approved and when it has been
                processed. Keep this for your records.
              </p>
            </section>

            <section>
              <h2>8. Chargebacks</h2>

              <h3>8.1 Contact Us First</h3>
              <p>
                <strong>Please contact us before initiating a chargeback or dispute with your bank.</strong>
                We are committed to resolving billing issues and will work with you to find a solution.
              </p>

              <h3>8.2 Chargeback Consequences</h3>
              <p>
                If you initiate a chargeback without first contacting us, it may result in:
              </p>
              <ul>
                <li>Immediate suspension of your account</li>
                <li>Potential loss of access to your data and content</li>
                <li>Permanent ban from future use of the Service</li>
                <li>Legal action to recover chargeback fees and costs</li>
              </ul>
              <p>
                Chargebacks should only be used as a last resort for unauthorized charges after
                attempting to resolve the issue with us directly.
              </p>
            </section>

            <section>
              <h2>9. Promotional Offers and Discounts</h2>
              <p>
                Subscriptions purchased with promotional codes, discounts, or special offers may have
                different refund terms as specified at the time of purchase. These terms will be clearly
                communicated before you complete your purchase.
              </p>
              <p>
                Generally:
              </p>
              <ul>
                <li>The 30-day guarantee still applies to first-time subscribers</li>
                <li>Refunds, if approved, may be prorated based on the discounted price paid</li>
                <li>Some promotional offers may be non-refundable (clearly indicated at purchase)</li>
              </ul>
            </section>

            <section>
              <h2>10. Annual Subscriptions</h2>
              <p>
                If we offer annual subscription options in the future:
              </p>
              <ul>
                <li>The 30-day money-back guarantee applies to first-time annual subscribers</li>
                <li>After 30 days, annual subscriptions are non-refundable</li>
                <li>You may cancel to prevent auto-renewal for the next year</li>
                <li>Partial year refunds are not provided</li>
              </ul>
            </section>

            <section>
              <h2>11. Fair Use of Refund Policy</h2>
              <p>
                We reserve the right to deny refund requests that appear to abuse our refund policy,
                including but not limited to:
              </p>
              <ul>
                <li>Repeated refund requests across multiple accounts</li>
                <li>Requesting refunds after consuming significant service resources</li>
                <li>Patterns of subscription and refund cycles</li>
                <li>Fraudulent refund requests</li>
              </ul>
              <p>
                Abuse of our refund policy may result in permanent account termination and ban from
                future service use.
              </p>
            </section>

            <section>
              <h2>12. Policy Changes</h2>
              <p>
                We may update this Refund Policy from time to time. Changes will be communicated via:
              </p>
              <ul>
                <li>Email notification to active subscribers</li>
                <li>Posting the updated policy with a new "Last Updated" date</li>
                <li>Prominent notice on our Service (for material changes)</li>
              </ul>
              <p>
                Changes to this policy do not affect existing subscriptions. The policy in effect at the
                time of your purchase governs your refund rights for that purchase.
              </p>
              <p>
                We will provide at least 30 days' notice for any changes that materially reduce your refund rights.
              </p>
            </section>

            <section>
              <h2>13. Contact Information</h2>
              <p>
                For refund requests or questions about this policy:
              </p>
              <ul className="list-none pl-0">
                <li><strong>Email:</strong> {SUPPORT_EMAIL}</li>
                <li><strong>Subject Line:</strong> "Refund Request" or "Refund Policy Question"</li>
                <li><strong>Response Time:</strong> Within 24-48 hours</li>
              </ul>
              <p>
                Please include your account email and relevant details to help us process your request
                quickly.
              </p>
            </section>

            <section>
              <h2>14. Dispute Resolution</h2>
              <p>
                If you are not satisfied with our refund decision, you may request a review by a senior
                support representative. Email {SUPPORT_EMAIL} with "Refund Appeal" in the subject line.
              </p>
              <p>
                For unresolved disputes, refer to the Dispute Resolution section of our Terms of Service.
              </p>
            </section>

            <section className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <ul className="text-sm space-y-1">
                <li>✅ <strong>30-day money-back guarantee</strong> for first-time subscribers</li>
                <li>✅ <strong>Full refunds</strong> for billing errors and unauthorized charges</li>
                <li>✅ <strong>14-day refund window</strong> for one-time purchases with technical issues</li>
                <li>❌ <strong>No partial month refunds</strong> after 30-day guarantee period</li>
                <li>❌ <strong>No refunds</strong> for Terms of Service violations</li>
                <li>⏱️ <strong>3-5 business days</strong> for refund decision</li>
                <li>💳 <strong>5-10 business days</strong> for refund processing</li>
              </ul>
            </section>

            <section className="mt-4 p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Related Policies:</strong>{" "}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {" | "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
