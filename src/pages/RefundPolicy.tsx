import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Refund Policy</CardTitle>
            <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Subscription Refunds</h2>
            <p>Our contributor subscription ($1.97/month) operates under the following refund policy:</p>

            <h3>Standard Policy</h3>
            <ul>
              <li><strong>No Partial Month Refunds:</strong> We do not offer refunds for partial billing periods</li>
              <li><strong>Cancel Anytime:</strong> You can cancel your subscription at any time to prevent future charges</li>
              <li><strong>Access Until Period End:</strong> You retain access until the end of your current billing period after cancellation</li>
            </ul>

            <h3>Exceptions</h3>
            <p>We may issue refunds in the following cases:</p>
            <ul>
              <li><strong>Technical Issues:</strong> If our service was unavailable for extended periods due to our fault</li>
              <li><strong>Billing Errors:</strong> If you were charged incorrectly or multiple times</li>
              <li><strong>First-Time Subscribers:</strong> 7-day money-back guarantee for new subscribers who haven't actively used the service</li>
            </ul>

            <h2>2. Refund Request Process</h2>
            <p>To request a refund:</p>
            <ol>
              <li>Contact our support team through your profile settings</li>
              <li>Provide your account email and reason for refund</li>
              <li>We will review your request within 3-5 business days</li>
              <li>Approved refunds are processed within 5-10 business days</li>
            </ol>

            <h2>3. Refund Method</h2>
            <p>Approved refunds will be issued to the original payment method used for the purchase.</p>

            <h2>4. Chargebacks</h2>
            <p>Please contact us before initiating a chargeback. Chargebacks may result in:</p>
            <ul>
              <li>Immediate account suspension</li>
              <li>Loss of all submitted content</li>
              <li>Permanent ban from future service use</li>
            </ul>

            <h2>5. Promotional Offers</h2>
            <p>Subscriptions purchased with promotional discounts or trial periods may have different refund terms as specified at purchase time.</p>

            <h2>6. Account Termination</h2>
            <p>If we terminate your account for violation of our Terms of Service, no refund will be issued.</p>

            <h2>7. Fair Use</h2>
            <p>We reserve the right to deny refund requests that appear to abuse our refund policy.</p>

            <h2>8. Contact</h2>
            <p>For refund requests or questions, please contact us through the support section in your profile.</p>

            <h2>9. Policy Changes</h2>
            <p>We may update this refund policy with 30 days notice. Changes do not affect existing subscriptions.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;
