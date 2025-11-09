import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Information We Collect</h2>
            <h3>Personal Information</h3>
            <ul>
              <li>Email address (for account creation and communication)</li>
              <li>Name (optional, for display purposes)</li>
              <li>Payment information (processed securely by Stripe)</li>
            </ul>

            <h3>Usage Information</h3>
            <ul>
              <li>Content you submit (facts, comments, votes)</li>
              <li>Interaction data (page views, clicks)</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To process payments and subscriptions</li>
              <li>To send service-related notifications</li>
              <li>To improve and personalize user experience</li>
              <li>To prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>We do not sell your personal information. We share data only with:</p>
            <ul>
              <li><strong>Payment Processors:</strong> Stripe for payment processing</li>
              <li><strong>Service Providers:</strong> Hosting, analytics, and infrastructure partners</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>Encrypted data transmission (SSL/TLS)</li>
              <li>Secure database storage</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
            </ul>

            <h2>5. Your Rights (GDPR Compliance)</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Objection:</strong> Object to certain data processing</li>
            </ul>

            <h2>6. Cookies & Tracking</h2>
            <p>We use essential cookies for authentication and preferences. We may use analytics cookies to improve our service. You can control cookie preferences in your browser settings.</p>

            <h2>7. Data Retention</h2>
            <p>We retain your data as long as your account is active. After account deletion, we may retain some data for legal compliance and fraud prevention.</p>

            <h2>8. Children's Privacy</h2>
            <p>Our service is not intended for users under 13. We do not knowingly collect data from children.</p>

            <h2>9. International Data Transfers</h2>
            <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.</p>

            <h2>10. Changes to Privacy Policy</h2>
            <p>We may update this policy and will notify users of significant changes via email.</p>

            <h2>11. Contact Us</h2>
            <p>For privacy-related questions or to exercise your rights, contact us through our support channels.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
