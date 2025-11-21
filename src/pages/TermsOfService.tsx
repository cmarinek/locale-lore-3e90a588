import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const TermsOfService = () => {
  // TODO: Update these remaining values with actual business information
  const BUSINESS_NAME = "Ascend Leads DBA Localelore"; // e.g., "LocaleLore LLC" or "John Doe DBA LocaleLore"
  const BUSINESS_ADDRESS = "2715 East Lehigh Avenue, Philadelphia, PA. 19125"; // Your registered business address
  const SUPPORT_EMAIL = "support@localelore.org"; // ✅ CONFIGURED
  const LEGAL_EMAIL = "legal@localelore.org"; // TODO: Set up email forwarding
  const PRIVACY_EMAIL = "privacy@localelore.org"; // TODO: Set up email forwarding
  const EFFECTIVE_DATE = "November 22, 2025"; // TODO: Set to launch date (typically 2 weeks notice)
  const JURISDICTION = "Pennsylvania"; // e.g., "Delaware" or "California"

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Legal Notice:</strong> This document contains placeholder values in [brackets].
            All placeholders must be replaced with actual business information and reviewed by legal counsel
            before going live.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">
              Effective Date: {EFFECTIVE_DATE}<br />
              Last Updated: {EFFECTIVE_DATE}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                Welcome to LocaleLore ("Service", "Platform", "we", "us", or "our"). These Terms of Service
                ("Terms") constitute a legally binding agreement between you ("you", "your", or "User") and
                {BUSINESS_NAME}, governing your access to and use of the LocaleLore platform, including our
                website, mobile applications, and all related services.
              </p>
              <p>
                <strong>BY ACCESSING OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD,
                AND AGREE TO BE BOUND BY THESE TERMS.</strong> If you do not agree to these Terms, you must
                not access or use the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service, including
                free users, subscribers, and contributors.
              </p>
            </section>

            <section>
              <h2>2. Eligibility</h2>
              <p>
                You must be at least 13 years old to use this Service. If you are under 18 years of age (or
                the age of legal majority in your jurisdiction), you must have your parent or legal guardian's
                permission to use the Service and your parent or legal guardian must agree to these Terms on
                your behalf.
              </p>
              <p>
                By using the Service, you represent and warrant that:
              </p>
              <ul>
                <li>You meet the age requirements stated above</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>You are not barred from using the Service under applicable laws</li>
                <li>All information you provide is accurate, complete, and current</li>
              </ul>
            </section>

            <section>
              <h2>3. Account Registration and Security</h2>
              <h3>3.1 Account Creation</h3>
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, complete, and current registration information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use or security breach</li>
              </ul>

              <h3>3.2 Account Responsibility</h3>
              <p>
                You are solely responsible for all activity that occurs under your account. We reserve the
                right to disable any account at any time if we believe you have violated these Terms.
              </p>

              <h3>3.3 Account Termination</h3>
              <p>
                You may terminate your account at any time through your account settings or by contacting
                us at {SUPPORT_EMAIL}. Upon termination, your right to access and use the Service will
                immediately cease.
              </p>
            </section>

            <section>
              <h2>4. Subscription Plans and Payments</h2>
              <h3>4.1 Subscription Tiers</h3>
              <p>LocaleLore offers the following subscription plans:</p>
              <ul>
                <li><strong>Free Plan:</strong> Free - Browse all facts, explore maps, search and discover content</li>
                <li><strong>Contributor Plan:</strong> $4.97/month - Unlimited fact submissions, commenting, voting, advanced features, priority support, and analytics</li>
              </ul>

              <h3>4.2 Free Trial</h3>
              <p>
                New subscribers may receive a 3-day free trial. You will not be charged during the trial
                period. If you do not cancel before the trial ends, you will automatically be charged for
                your selected subscription plan.
              </p>

              <h3>4.3 Billing and Payment</h3>
              <p>
                By subscribing, you authorize us to charge your designated payment method on a recurring
                basis according to your selected billing cycle (monthly or annually). You agree to:
              </p>
              <ul>
                <li>Provide current, complete, and accurate billing information</li>
                <li>Promptly update payment information if it changes</li>
                <li>Pay all charges at the prices in effect when incurred</li>
                <li>Be responsible for all applicable taxes</li>
              </ul>

              <h3>4.4 Automatic Renewal</h3>
              <p>
                Your subscription will automatically renew at the end of each billing period unless you
                cancel before the renewal date. We will charge your payment method for the next billing
                period within 24 hours of the renewal date.
              </p>

              <h3>4.5 Cancellation</h3>
              <p>
                You may cancel your subscription at any time through your account settings or by contacting
                {SUPPORT_EMAIL}. Cancellation will be effective at the end of your current billing period.
                You will retain access to paid features until the end of your paid period.
              </p>

              <h3>4.6 Refund Policy</h3>
              <p>
                We offer refunds under the following circumstances:
              </p>
              <ul>
                <li>Technical issues preventing service access (subject to verification)</li>
                <li>Unauthorized charges (subject to investigation)</li>
                <li>Within 30 days of initial subscription purchase (first-time subscribers only)</li>
              </ul>
              <p>
                No refunds will be provided for partial subscription periods or unused portions of your
                subscription. To request a refund, contact {SUPPORT_EMAIL} with your account details and
                reason for the request.
              </p>

              <h3>4.7 Price Changes</h3>
              <p>
                We reserve the right to change our prices with 30 days' advance notice. Price changes will
                take effect at the start of your next billing cycle after the notice period. Continued use
                of the Service after a price change constitutes acceptance of the new price.
              </p>

              <h3>4.8 One-Time Purchases</h3>
              <p>
                Certain features may be available as one-time purchases. These purchases are non-refundable
                except as required by law and do not auto-renew.
              </p>
            </section>

            <section>
              <h2>5. User Content and Conduct</h2>
              <h3>5.1 User-Generated Content</h3>
              <p>
                The Service allows you to create, upload, and share content including stories, facts, images,
                and comments ("User Content"). You retain all ownership rights to your User Content.
              </p>

              <h3>5.2 License Grant</h3>
              <p>
                By submitting User Content, you grant {BUSINESS_NAME} a worldwide, non-exclusive, royalty-free,
                sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works
                of, display, and perform the User Content in connection with the Service and our business,
                including for promoting and redistributing part or all of the Service.
              </p>

              <h3>5.3 Content Responsibilities</h3>
              <p>You represent and warrant that your User Content:</p>
              <ul>
                <li>Is accurate and not misleading</li>
                <li>Does not infringe any intellectual property or privacy rights</li>
                <li>Does not violate any applicable laws or regulations</li>
                <li>Does not contain viruses, malware, or other harmful code</li>
                <li>Does not contain personal information of others without permission</li>
              </ul>

              <h3>5.4 Prohibited Content</h3>
              <p>You agree not to post User Content that:</p>
              <ul>
                <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of privacy</li>
                <li>Promotes violence, discrimination, or hatred against individuals or groups</li>
                <li>Contains sexually explicit material or exploits minors</li>
                <li>Infringes intellectual property rights or contains unauthorized copyrighted content</li>
                <li>Contains false, deceptive, or misleading information</li>
                <li>Promotes illegal activities or violates any laws</li>
                <li>Contains spam, advertising, or commercial solicitation</li>
                <li>Impersonates any person or entity</li>
              </ul>

              <h3>5.5 Content Moderation</h3>
              <p>
                We reserve the right, but have no obligation, to monitor, review, and remove User Content
                that violates these Terms or is otherwise objectionable. We may suspend or terminate accounts
                that repeatedly violate these Terms.
              </p>

              <h3>5.6 Prohibited Conduct</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Interfere with or disrupt the Service or servers/networks connected to the Service</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use any automated systems (bots, scrapers, etc.) without written permission</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                <li>Collect or harvest personal information of other users</li>
                <li>Engage in any activity that imposes an unreasonable load on our infrastructure</li>
                <li>Circumvent any access restrictions or security features</li>
                <li>Sell, resell, or commercially exploit the Service without permission</li>
              </ul>
            </section>

            <section>
              <h2>6. Intellectual Property Rights</h2>
              <h3>6.1 Our Intellectual Property</h3>
              <p>
                The Service and its original content (excluding User Content), features, and functionality
                are and will remain the exclusive property of {BUSINESS_NAME} and its licensors. The Service
                is protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3>6.2 Trademarks</h3>
              <p>
                "LocaleLore" and our logos are trademarks of {BUSINESS_NAME}. You may not use these marks
                without our prior written permission.
              </p>

              <h3>6.3 Limited License</h3>
              <p>
                We grant you a limited, non-exclusive, non-transferable, revocable license to access and
                use the Service for your personal, non-commercial use, subject to these Terms.
              </p>

              <h3>6.4 Copyright Infringement</h3>
              <p>
                We respect intellectual property rights. If you believe any content infringes your copyright,
                please contact us at {LEGAL_EMAIL} with:
              </p>
              <ul>
                <li>A description of the copyrighted work</li>
                <li>The location of the infringing material</li>
                <li>Your contact information</li>
                <li>A statement of good faith belief that use is not authorized</li>
                <li>A statement that the information is accurate and you are authorized to act</li>
                <li>Your physical or electronic signature</li>
              </ul>
            </section>

            <section>
              <h2>7. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect
                your personal information. By using the Service, you agree to our collection and use of
                information as described in our Privacy Policy, which is incorporated into these Terms by
                reference.
              </p>
            </section>

            <section>
              <h2>8. Third-Party Services and Links</h2>
              <p>
                The Service may contain links to third-party websites or services that are not owned or
                controlled by {BUSINESS_NAME}. We have no control over, and assume no responsibility for,
                the content, privacy policies, or practices of any third-party websites or services.
              </p>
              <p>
                We use third-party service providers, including:
              </p>
              <ul>
                <li>Stripe for payment processing</li>
                <li>Mapbox for mapping services</li>
                <li>Supabase for hosting and database services</li>
                <li>Sentry for error tracking</li>
              </ul>
              <p>
                Your use of these services is subject to their respective terms and conditions.
              </p>
            </section>

            <section>
              <h2>9. Disclaimers and Limitations of Liability</h2>
              <h3>9.1 "As Is" Disclaimer</h3>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR
                A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p>
                {BUSINESS_NAME} does not warrant that:
              </p>
              <ul>
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>The results obtained from using the Service will be accurate or reliable</li>
                <li>The quality of any content or information will meet your expectations</li>
                <li>Any errors in the Service will be corrected</li>
              </ul>

              <h3>9.2 Limitation of Liability</h3>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, {BUSINESS_NAME} SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF
                PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul>
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your content</li>
              </ul>
              <p>
                IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12)
                MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </p>

              <h3>9.3 User Content Disclaimer</h3>
              <p>
                We are not responsible for User Content and do not endorse any opinions expressed by users.
                User Content does not reflect the views of {BUSINESS_NAME}.
              </p>
            </section>

            <section>
              <h2>10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless {BUSINESS_NAME}, its officers, directors,
                employees, agents, licensors, and suppliers from and against all claims, losses, expenses,
                damages, and costs, including reasonable attorneys' fees, resulting from:
              </p>
              <ul>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your use of the Service</li>
                <li>Your User Content</li>
              </ul>
            </section>

            <section>
              <h2>11. Dispute Resolution and Governing Law</h2>
              <h3>11.1 Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of {JURISDICTION},
                without regard to its conflict of law provisions.
              </p>

              <h3>11.2 Dispute Resolution</h3>
              <p>
                Any dispute arising from these Terms or the Service shall be resolved through:
              </p>
              <ol>
                <li><strong>Informal Negotiation:</strong> Contact us at {LEGAL_EMAIL} to attempt resolution</li>
                <li><strong>Mediation:</strong> If negotiation fails, parties agree to mediation</li>
                <li><strong>Arbitration:</strong> If mediation fails, disputes shall be resolved by binding arbitration
                in accordance with the rules of [ARBITRATION ORGANIZATION] in {JURISDICTION}</li>
              </ol>

              <h3>11.3 Class Action Waiver</h3>
              <p>
                You agree that disputes will be resolved on an individual basis. You waive your right to
                participate in a class action lawsuit or class-wide arbitration.
              </p>

              <h3>11.4 Exceptions</h3>
              <p>
                Either party may seek injunctive or other equitable relief in court to protect intellectual
                property rights.
              </p>
            </section>

            <section>
              <h2>12. Term and Termination</h2>
              <h3>12.1 Term</h3>
              <p>
                These Terms remain in effect while you use the Service.
              </p>

              <h3>12.2 Termination by You</h3>
              <p>
                You may terminate your account at any time by following the account deletion process in your
                settings or contacting {SUPPORT_EMAIL}.
              </p>

              <h3>12.3 Termination by Us</h3>
              <p>
                We may suspend or terminate your access to the Service immediately, without prior notice or
                liability, for any reason, including:
              </p>
              <ul>
                <li>Violation of these Terms</li>
                <li>Fraudulent activity or security concerns</li>
                <li>Extended periods of inactivity</li>
                <li>Legal requirements</li>
              </ul>

              <h3>12.4 Effect of Termination</h3>
              <p>
                Upon termination:
              </p>
              <ul>
                <li>Your right to access and use the Service will immediately cease</li>
                <li>We may delete your account and data within 30 days</li>
                <li>You will not be entitled to any refund of prepaid fees</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </section>

            <section>
              <h2>13. Changes to These Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material
                changes by:
              </p>
              <ul>
                <li>Posting the new Terms on this page with a new "Last Updated" date</li>
                <li>Sending email notification to your registered email address</li>
                <li>Displaying a prominent notice on the Service</li>
              </ul>
              <p>
                Your continued use of the Service after changes become effective constitutes acceptance of
                the new Terms. If you do not agree to the new Terms, you must stop using the Service.
              </p>
            </section>

            <section>
              <h2>14. General Provisions</h2>
              <h3>14.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy, constitute the entire agreement between you
                and {BUSINESS_NAME} regarding the Service.
              </p>

              <h3>14.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will
                continue in full force and effect.
              </p>

              <h3>14.3 Waiver</h3>
              <p>
                Our failure to enforce any right or provision of these Terms will not be considered a waiver
                of those rights.
              </p>

              <h3>14.4 Assignment</h3>
              <p>
                You may not assign or transfer these Terms without our written consent. We may assign our
                rights and obligations without restriction.
              </p>

              <h3>14.5 Force Majeure</h3>
              <p>
                We will not be liable for any failure to perform our obligations due to circumstances beyond
                our reasonable control, including natural disasters, war, terrorism, riots, embargoes, acts
                of civil or military authorities, fire, floods, accidents, strikes, or shortages of
                transportation, facilities, fuel, energy, labor, or materials.
              </p>

              <h3>14.6 Survival</h3>
              <p>
                Provisions that by their nature should survive termination shall survive, including but not
                limited to ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>

              <h3>14.7 Electronic Communications</h3>
              <p>
                By using the Service, you consent to receive electronic communications from us. You agree
                that all agreements, notices, disclosures, and other communications provided electronically
                satisfy any legal requirement that such communications be in writing.
              </p>
            </section>

            <section>
              <h2>15. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-none pl-0">
                <li><strong>Company Name:</strong> {BUSINESS_NAME}</li>
                <li><strong>Address:</strong> {BUSINESS_ADDRESS}</li>
                <li><strong>Email:</strong> {LEGAL_EMAIL}</li>
                <li><strong>Support:</strong> {SUPPORT_EMAIL}</li>
              </ul>
            </section>

            <section className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Acknowledgment</h3>
              <p className="text-sm">
                BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE, UNDERSTAND
                THEM, AND AGREE TO BE BOUND BY THEM.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
