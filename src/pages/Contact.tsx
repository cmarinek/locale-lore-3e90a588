import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, MapPin, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Replace remaining with actual business information
  const BUSINESS_NAME = "[YOUR LEGAL ENTITY NAME]"; // e.g., "LocaleLore LLC"
  const BUSINESS_ADDRESS = "[YOUR REGISTERED ADDRESS]"; // Your registered business address
  const SUPPORT_EMAIL = "support@localelore.org"; // ✅ CONFIGURED
  const LEGAL_EMAIL = "legal@localelore.org"; // TODO: Set up email forwarding
  const PRIVACY_EMAIL = "privacy@localelore.org"; // TODO: Set up email forwarding
  const SECURITY_EMAIL = "security@localelore.org"; // TODO: Set up email forwarding

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual form submission
    // This should send to your contact form endpoint
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24-48 hours.",
      });
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> Replace placeholder values in [brackets] and implement
            actual contact form submission before going live.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Get in Touch</CardTitle>
              <p className="text-muted-foreground">
                Have a question or need support? Send us a message and we'll respond within 24-48 hours.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="How can we help?"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tell us more about your question or issue..."
                    rows={6}
                    disabled={isSubmitting}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By submitting this form, you agree to our{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Business Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{BUSINESS_NAME}</p>
                  <p className="text-sm text-muted-foreground">{BUSINESS_ADDRESS}</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">General Support</p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Legal Inquiries</p>
                  <a
                    href={`mailto:${LEGAL_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {LEGAL_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Privacy Concerns</p>
                  <a
                    href={`mailto:${PRIVACY_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {PRIVACY_EMAIL}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Security Issues</p>
                  <a
                    href={`mailto:${SECURITY_EMAIL}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {SECURITY_EMAIL}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Response Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">General Support</p>
                  <p className="text-sm text-muted-foreground">Within 24-48 hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Critical Issues</p>
                  <p className="text-sm text-muted-foreground">Within 4-8 hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Security Concerns</p>
                  <p className="text-sm text-muted-foreground">Immediate priority response</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Business Hours:</strong> Monday-Friday, 9 AM - 5 PM EST<br />
                    We aim to respond to all inquiries as quickly as possible, including weekends for urgent matters.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Reach Us */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Other Ways to Reach Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Help Center</p>
                  <a href="/help" className="text-sm text-primary hover:underline">
                    Browse FAQs and guides
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Account Issues</p>
                  <a href="/settings" className="text-sm text-primary hover:underline">
                    Visit your account settings
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Report Content</p>
                  <p className="text-sm text-muted-foreground">
                    Use the "Report" button on any story or fact
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">How do I cancel my subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Visit your account settings and navigate to the Billing section to cancel your subscription
                at any time. Your access will continue until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How do I request a refund?</h3>
              <p className="text-sm text-muted-foreground">
                Email {SUPPORT_EMAIL} with your account email and reason for the refund request. See our{" "}
                <a href="/refund-policy" className="text-primary hover:underline">
                  Refund Policy
                </a>{" "}
                for eligibility details.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How do I delete my account?</h3>
              <p className="text-sm text-muted-foreground">
                Go to Settings {">"} Privacy {">"} Delete Account. Your data will be permanently deleted
                after a 30-day grace period. See our{" "}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                for more information.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">How do I report a security vulnerability?</h3>
              <p className="text-sm text-muted-foreground">
                Please email {SECURITY_EMAIL} immediately with details. We take security seriously and
                will respond promptly to all reports.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">I'm having technical issues. What should I do?</h3>
              <p className="text-sm text-muted-foreground">
                First, try clearing your browser cache and cookies. If the issue persists, email{" "}
                {SUPPORT_EMAIL} with a description of the problem, including your device, browser, and
                steps to reproduce the issue.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
