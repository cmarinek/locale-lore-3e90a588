import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h2>2. Subscription & Payments</h2>
            <p>Our contributor subscription is billed monthly at $1.97/month. By subscribing, you authorize us to charge your payment method on a recurring basis.</p>
            <ul>
              <li>Subscriptions renew automatically until cancelled</li>
              <li>You can cancel anytime from your profile settings</li>
              <li>No refunds for partial months</li>
              <li>Prices subject to change with 30 days notice</li>
            </ul>

            <h2>3. User Conduct</h2>
            <p>As a contributor, you agree to:</p>
            <ul>
              <li>Submit accurate and truthful information</li>
              <li>Respect intellectual property rights</li>
              <li>Not submit offensive, harmful, or illegal content</li>
              <li>Not attempt to circumvent security measures</li>
            </ul>

            <h2>4. Content Ownership</h2>
            <p>You retain ownership of content you submit. By submitting content, you grant us a worldwide, non-exclusive license to use, display, and distribute your content on our platform.</p>

            <h2>5. Account Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms without refund.</p>

            <h2>6. Limitation of Liability</h2>
            <p>We provide the service "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages.</p>

            <h2>7. Changes to Terms</h2>
            <p>We may modify these terms at any time. Continued use after changes constitutes acceptance of new terms.</p>

            <h2>8. Contact</h2>
            <p>For questions about these terms, please contact us through our support channels.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
