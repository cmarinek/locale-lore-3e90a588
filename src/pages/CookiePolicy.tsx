import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CookiePolicy = () => {
  const BUSINESS_NAME = "[YOUR LEGAL ENTITY NAME]"; // e.g., "LocaleLore LLC"
  const EFFECTIVE_DATE = "December 1, 2025"; // TODO: Set to launch date
  const PRIVACY_EMAIL = "privacy@localelore.org"; // TODO: Set up email forwarding

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
            <CardTitle className="text-3xl">Cookie Policy</CardTitle>
            <p className="text-muted-foreground">
              Effective Date: {EFFECTIVE_DATE}<br />
              Last Updated: {EFFECTIVE_DATE}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <section>
              <h2>1. What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device (computer, tablet, or mobile) when you
                visit a website. They help websites remember your preferences and improve your experience.
              </p>
              <p>
                This Cookie Policy explains how {BUSINESS_NAME} ("we", "us", or "our") uses cookies and
                similar tracking technologies on the LocaleLore platform.
              </p>
            </section>

            <section>
              <h2>2. Types of Cookies We Use</h2>

              <h3>2.1 Essential Cookies (Always Active)</h3>
              <p>
                These cookies are strictly necessary for the Service to function. They enable core functionality
                such as security, authentication, and accessibility. You cannot opt out of these cookies.
              </p>
              <table className="w-full border-collapse border border-border my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Cookie Name</th>
                    <th className="border border-border p-2 text-left">Purpose</th>
                    <th className="border border-border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2"><code>sb-access-token</code></td>
                    <td className="border border-border p-2">Authentication - keeps you logged in</td>
                    <td className="border border-border p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>sb-refresh-token</code></td>
                    <td className="border border-border p-2">Session refresh</td>
                    <td className="border border-border p-2">Persistent (30 days)</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>cookie-consent</code></td>
                    <td className="border border-border p-2">Stores your cookie preferences</td>
                    <td className="border border-border p-2">1 year</td>
                  </tr>
                </tbody>
              </table>

              <h3>2.2 Functional Cookies</h3>
              <p>
                These cookies enable enhanced functionality and personalization, such as remembering your
                preferences and settings.
              </p>
              <table className="w-full border-collapse border border-border my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Cookie Name</th>
                    <th className="border border-border p-2 text-left">Purpose</th>
                    <th className="border border-border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2"><code>theme-preference</code></td>
                    <td className="border border-border p-2">Remembers your theme choice (dark/light mode)</td>
                    <td className="border border-border p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>language-preference</code></td>
                    <td className="border border-border p-2">Stores your language selection</td>
                    <td className="border border-border p-2">1 year</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>map-settings</code></td>
                    <td className="border border-border p-2">Remembers your map view preferences</td>
                    <td className="border border-border p-2">30 days</td>
                  </tr>
                </tbody>
              </table>

              <h3>2.3 Analytics Cookies</h3>
              <p>
                These cookies help us understand how visitors interact with our Service by collecting and
                reporting information anonymously. This helps us improve the Service.
              </p>
              <table className="w-full border-collapse border border-border my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Cookie Name</th>
                    <th className="border border-border p-2 text-left">Purpose</th>
                    <th className="border border-border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2"><code>_ga</code></td>
                    <td className="border border-border p-2">Google Analytics - distinguishes users</td>
                    <td className="border border-border p-2">2 years</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>_gid</code></td>
                    <td className="border border-border p-2">Google Analytics - distinguishes users</td>
                    <td className="border border-border p-2">24 hours</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>analytics-session</code></td>
                    <td className="border border-border p-2">Tracks usage patterns and performance</td>
                    <td className="border border-border p-2">Session</td>
                  </tr>
                </tbody>
              </table>

              <h3>2.4 Performance Cookies</h3>
              <p>
                These cookies collect information about how you use the Service to help us improve performance
                and fix issues.
              </p>
              <table className="w-full border-collapse border border-border my-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Cookie Name</th>
                    <th className="border border-border p-2 text-left">Purpose</th>
                    <th className="border border-border p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2"><code>sentry-session</code></td>
                    <td className="border border-border p-2">Error tracking and monitoring</td>
                    <td className="border border-border p-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-2"><code>web-vitals</code></td>
                    <td className="border border-border p-2">Measures page load performance</td>
                    <td className="border border-border p-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2>3. Third-Party Cookies</h2>
              <p>
                Some cookies are placed by third-party services that appear on our pages. We do not control
                these cookies.
              </p>
              <ul>
                <li><strong>Stripe:</strong> Payment processing cookies for secure transactions</li>
                <li><strong>Mapbox:</strong> Map functionality and location services</li>
                <li><strong>Google:</strong> Authentication and analytics</li>
              </ul>
              <p>
                These third parties have their own privacy policies governing their use of cookies. We
                recommend reviewing:
              </p>
              <ul>
                <li><a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Cookie Policy</a></li>
                <li><a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mapbox Privacy Policy</a></li>
                <li><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cookie Policy</a></li>
              </ul>
            </section>

            <section>
              <h2>4. How to Control Cookies</h2>

              <h3>4.1 Browser Settings</h3>
              <p>
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul>
                <li>View what cookies are stored on your device</li>
                <li>Delete existing cookies</li>
                <li>Block cookies from being set</li>
                <li>Block third-party cookies</li>
              </ul>
              <p>Learn how to manage cookies in popular browsers:</p>
              <ul>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
              </ul>

              <h3>4.2 Cookie Consent Banner</h3>
              <p>
                When you first visit LocaleLore, we display a cookie consent banner where you can:
              </p>
              <ul>
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your cookie preferences</li>
              </ul>
              <p>
                You can change your preferences at any time by clicking the "Cookie Settings" link in our
                website footer.
              </p>

              <h3>4.3 Opt-Out Tools</h3>
              <p>For analytics cookies, you can opt out using these tools:</p>
              <ul>
                <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
                <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Digital Advertising Alliance Opt-Out</a></li>
              </ul>
            </section>

            <section>
              <h2>5. Impact of Disabling Cookies</h2>
              <p>
                If you disable or refuse cookies, some parts of the Service may not function properly:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> You will not be able to log in or use authenticated features</li>
                <li><strong>Functional Cookies:</strong> Your preferences will not be saved</li>
                <li><strong>Analytics Cookies:</strong> We won't be able to improve the Service based on usage data</li>
              </ul>
              <p>
                We recommend keeping essential cookies enabled to ensure the best experience.
              </p>
            </section>

            <section>
              <h2>6. Mobile Devices</h2>
              <p>
                On mobile devices, we use similar technologies to cookies:
              </p>
              <ul>
                <li><strong>Local Storage:</strong> Stores small amounts of data locally on your device</li>
                <li><strong>Device Identifiers:</strong> Unique identifiers for analytics and personalization</li>
                <li><strong>Mobile SDKs:</strong> Third-party software development kits (e.g., Capacitor)</li>
              </ul>
              <p>
                You can control these through your device settings:
              </p>
              <ul>
                <li><strong>iOS:</strong> Settings {">"} Privacy & Security {">"} Tracking</li>
                <li><strong>Android:</strong> Settings {">"} Google {">"} Ads</li>
              </ul>
            </section>

            <section>
              <h2>7. Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy to reflect changes in our practices or for legal, regulatory,
                or operational reasons. We will post the updated policy with a new "Last Updated" date.
              </p>
              <p>
                We encourage you to review this policy periodically. Your continued use of the Service after
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2>8. Contact Us</h2>
              <p>
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <ul className="list-none pl-0">
                <li><strong>Privacy Email:</strong> {PRIVACY_EMAIL}</li>
                <li><strong>Website:</strong> <a href="/contact" className="text-primary hover:underline">Contact Form</a></li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Related Policies</h3>
              <p className="text-sm">
                For more information about how we handle your data, please see our:
              </p>
              <ul className="text-sm mt-2">
                <li><a href="/privacy" className="text-primary hover:underline">Privacy Policy</a></li>
                <li><a href="/terms" className="text-primary hover:underline">Terms of Service</a></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
