import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PrivacyPolicy = () => {
  // TODO: Update these values with actual business information
  const BUSINESS_NAME = "[LOCALELORE, INC.]";
  const BUSINESS_ADDRESS = "[123 Main Street, City, State, ZIP, Country]";
  const SUPPORT_EMAIL = "support@localelore.com";
  const PRIVACY_EMAIL = "privacy@localelore.com";
  const DPO_EMAIL = "dpo@localelore.com"; // Data Protection Officer (if required)
  const EFFECTIVE_DATE = "January 1, 2025";

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Legal Notice:</strong> This document contains placeholder values in [brackets].
            All placeholders must be replaced with actual business information and reviewed by legal counsel
            before going live. This Privacy Policy is designed to comply with GDPR, CCPA, and other privacy regulations.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">
              Effective Date: {EFFECTIVE_DATE}<br />
              Last Updated: {EFFECTIVE_DATE}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <section>
              <h2>1. Introduction</h2>
              <p>
                Welcome to LocaleLore ("we", "us", "our", or "Service"). This Privacy Policy explains how
                {BUSINESS_NAME} collects, uses, discloses, and protects your personal information when you
                use our location-based storytelling platform.
              </p>
              <p>
                <strong>By using LocaleLore, you consent to the collection and use of your information as
                described in this Privacy Policy.</strong>
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>

              <h3>2.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, username, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Profile picture, bio, preferences</li>
                <li><strong>Content:</strong> Stories, facts, photos, comments, and other user-generated content</li>
                <li><strong>Location Data:</strong> Geographic coordinates when you create location-based content</li>
                <li><strong>Payment Information:</strong> Credit card details (securely processed by Stripe)</li>
                <li><strong>Communications:</strong> Messages, support inquiries, feedback</li>
              </ul>

              <h3>2.2 Information Collected Automatically</h3>
              <ul>
                <li><strong>Device Information:</strong> Device type, operating system, browser, unique identifiers</li>
                <li><strong>Usage Information:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong>Location Information:</strong> Approximate location based on IP address</li>
                <li><strong>IP Address:</strong> For security and analytics</li>
                <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
                <li><strong>Log Data:</strong> Access times, pages viewed, error logs</li>
              </ul>

              <h3>2.3 Information from Third Parties</h3>
              <ul>
                <li><strong>Social Login:</strong> Basic profile information from Google or other providers</li>
                <li><strong>Payment Processor:</strong> Transaction information from Stripe</li>
                <li><strong>Analytics:</strong> Aggregated usage data</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Information</h2>
              <ul>
                <li>Create and manage your account</li>
                <li>Process subscriptions and payments</li>
                <li>Display location-based content relevant to you</li>
                <li>Enable social features (friends, comments, messaging)</li>
                <li>Send notifications and communications</li>
                <li>Provide customer support</li>
                <li>Improve and personalize your experience</li>
                <li>Detect and prevent fraud, abuse, and security issues</li>
                <li>Enforce our Terms of Service</li>
                <li>Comply with legal obligations</li>
                <li>Conduct analytics and research</li>
              </ul>
            </section>

            <section>
              <h2>4. Legal Basis for Processing (GDPR)</h2>
              <p>For EEA/UK/Swiss users, we process your data based on:</p>
              <ul>
                <li><strong>Contract Performance:</strong> To provide the Service</li>
                <li><strong>Consent:</strong> For marketing emails and optional features</li>
                <li><strong>Legitimate Interests:</strong> To improve the Service, ensure security</li>
                <li><strong>Legal Obligation:</strong> To comply with laws</li>
              </ul>
            </section>

            <section>
              <h2>5. How We Share Your Information</h2>
              <p><strong>We do not sell your personal information.</strong> We share information only with:</p>

              <h3>5.1 Other Users</h3>
              <ul>
                <li>Public profile information (username, photo, bio)</li>
                <li>Stories, facts, and comments you post publicly</li>
                <li>Location data when you create location-based content</li>
              </ul>

              <h3>5.2 Service Providers</h3>
              <ul>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Supabase:</strong> Cloud hosting and database</li>
                <li><strong>Mapbox:</strong> Mapping services</li>
                <li><strong>Sentry:</strong> Error tracking</li>
                <li><strong>Email Services:</strong> Transactional and marketing emails</li>
              </ul>

              <h3>5.3 Legal Compliance</h3>
              <ul>
                <li>To comply with laws, regulations, court orders</li>
                <li>To protect our rights and safety</li>
                <li>To detect and prevent fraud or security issues</li>
              </ul>

              <h3>5.4 Business Transfers</h3>
              <p>
                If we are involved in a merger or acquisition, your information may be transferred.
                We will notify you before this occurs.
              </p>
            </section>

            <section>
              <h2>6. Your Privacy Rights</h2>

              <h3>6.1 All Users</h3>
              <ul>
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Update:</strong> Correct inaccurate information</li>
                <li><strong>Delete:</strong> Request account and data deletion</li>
                <li><strong>Control Communications:</strong> Opt out of marketing emails</li>
                <li><strong>Privacy Settings:</strong> Control who sees your content</li>
              </ul>

              <h3>6.2 EEA/UK/Swiss Users (GDPR)</h3>
              <p>Additional rights include:</p>
              <ul>
                <li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
                <li><strong>Right to Erasure:</strong> "Right to be forgotten"</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive data in machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing for direct marketing</li>
                <li><strong>Right to Withdraw Consent:</strong> At any time</li>
                <li><strong>Right to Lodge a Complaint:</strong> With your data protection authority</li>
              </ul>
              <p>Contact {PRIVACY_EMAIL} to exercise these rights.</p>

              <h3>6.3 California Residents (CCPA)</h3>
              <ul>
                <li><strong>Know:</strong> What personal information we collect</li>
                <li><strong>Delete:</strong> Request deletion of personal information</li>
                <li><strong>Opt-Out:</strong> Of sale of personal information (we don't sell data)</li>
                <li><strong>Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
              </ul>
            </section>

            <section>
              <h2>7. Data Retention</h2>
              <p>We retain your information as follows:</p>
              <ul>
                <li><strong>Account Information:</strong> While active + 30 days after deletion</li>
                <li><strong>User Content:</strong> While active + 30 days after deletion</li>
                <li><strong>Payment Records:</strong> 7 years for tax compliance</li>
                <li><strong>Transaction Records:</strong> 7 years for legal compliance</li>
                <li><strong>Support Communications:</strong> 3 years</li>
                <li><strong>Log Data:</strong> 90 days</li>
                <li><strong>Analytics Data:</strong> Anonymized data may be retained indefinitely</li>
              </ul>
            </section>

            <section>
              <h2>8. Data Security</h2>
              <p>We protect your information with:</p>
              <ul>
                <li><strong>Encryption:</strong> TLS/SSL for data in transit</li>
                <li><strong>Password Protection:</strong> Hashed and salted passwords</li>
                <li><strong>Access Controls:</strong> Strict limits on data access</li>
                <li><strong>Row Level Security:</strong> Database-level protections</li>
                <li><strong>Security Audits:</strong> Regular assessments</li>
                <li><strong>Monitoring:</strong> Continuous threat detection</li>
              </ul>
              <p>
                However, no method is 100% secure. You are responsible for protecting your account credentials.
              </p>
            </section>

            <section>
              <h2>9. Cookies and Tracking</h2>
              <p>
                We use cookies for authentication, preferences, and analytics. See our{" "}
                <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for details.
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for Service functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage</li>
                <li><strong>Preference Cookies:</strong> Remember your settings</li>
              </ul>
              <p>You can control cookies through your browser settings.</p>
            </section>

            <section>
              <h2>10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own,
                including the United States. We ensure appropriate safeguards through:
              </p>
              <ul>
                <li>Standard Contractual Clauses (EU Commission approved)</li>
                <li>Adequacy decisions</li>
                <li>Privacy Shield framework (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2>11. Children's Privacy</h2>
              <p>
                Our Service is not for children under 13. We do not knowingly collect information from
                children under 13. If you believe a child has provided us with information, contact
                {PRIVACY_EMAIL} and we will promptly delete it.
              </p>
              <p>
                Users aged 13-18 must have parental permission to use our Service.
              </p>
            </section>

            <section>
              <h2>12. Third-Party Services</h2>
              <p>Our Service integrates with third-party services, each with their own privacy policies:</p>
              <ul>
                <li><strong>Stripe:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/privacy</a></li>
                <li><strong>Mapbox:</strong> <a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com/legal/privacy</a></li>
                <li><strong>Google:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">policies.google.com/privacy</a></li>
              </ul>
              <p>We are not responsible for third-party privacy practices.</p>
            </section>

            <section>
              <h2>13. Changes to This Policy</h2>
              <p>We may update this Privacy Policy. We will notify you of material changes by:</p>
              <ul>
                <li>Posting the updated policy with a new "Last Updated" date</li>
                <li>Sending email notification</li>
                <li>Displaying a prominent notice on our Service</li>
              </ul>
              <p>
                Continued use after changes constitutes acceptance. If you disagree, stop using the Service
                and delete your account.
              </p>
            </section>

            <section>
              <h2>14. Contact Us</h2>
              <p>For privacy questions or to exercise your rights:</p>
              <ul className="list-none pl-0">
                <li><strong>Company:</strong> {BUSINESS_NAME}</li>
                <li><strong>Address:</strong> {BUSINESS_ADDRESS}</li>
                <li><strong>Privacy Email:</strong> {PRIVACY_EMAIL}</li>
                <li><strong>Support:</strong> {SUPPORT_EMAIL}</li>
                <li><strong>Data Protection Officer:</strong> {DPO_EMAIL} (if applicable)</li>
              </ul>
              <p>We will respond within 30 days.</p>
            </section>

            <section>
              <h2>15. Data Protection Authority</h2>
              <p>
                EEA/UK/Swiss users can lodge complaints with their local supervisory authority if
                unsatisfied with our response:
              </p>
              <ul>
                <li><strong>UK:</strong> Information Commissioner's Office (ICO) - <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a></li>
                <li><strong>EEA:</strong> Find your authority at <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">EDPB Members</a></li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Acknowledgment</h3>
              <p className="text-sm">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS PRIVACY POLICY, UNDERSTAND IT,
                AND AGREE TO ITS TERMS.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
