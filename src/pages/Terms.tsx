import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Users, Shield, AlertTriangle, Gavel } from 'lucide-react';

export const Terms = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Terms of Service | Locale Lore</title>
        <meta name="description" content="Terms of Service and user agreement for Locale Lore platform." />
        <link rel="canonical" href={`${window.location.origin}/terms`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileText className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground">
              Please read these terms carefully before using our service.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                By accessing and using Locale Lore ("the Service"), you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Responsibility</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and password. 
                  You agree to accept responsibility for all activities under your account.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Age Requirements</h3>
                <p className="text-muted-foreground">
                  You must be at least 13 years old to use this service. Users under 18 must have 
                  parental consent.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Account Termination</h3>
                <p className="text-muted-foreground">
                  We reserve the right to terminate accounts that violate these terms or our community guidelines.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content and Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">User Content</h3>
                <p className="text-muted-foreground">
                  You retain ownership of content you create. By posting content, you grant us a license 
                  to display, distribute, and promote your content within the service.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Prohibited Content</h3>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Illegal, harmful, or offensive content</li>
                  <li>• Spam, harassment, or abusive behavior</li>
                  <li>• Misinformation or deliberately false content</li>
                  <li>• Content that violates intellectual property rights</li>
                  <li>• Personal information of others without consent</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy and Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>{' '}
                to understand how we collect, use, and protect your information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Premium Features</h3>
                <p className="text-muted-foreground">
                  Some features require a paid subscription. Subscription fees are billed in advance 
                  and are non-refundable except as required by law.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Cancellation</h3>
                <p className="text-muted-foreground">
                  You may cancel your subscription at any time through your account settings. 
                  Cancellation takes effect at the end of your current billing period.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Availability</h3>
                <p className="text-muted-foreground">
                  We strive for 99.9% uptime but cannot guarantee uninterrupted service. 
                  We may temporarily suspend service for maintenance or updates.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Content Accuracy</h3>
                <p className="text-muted-foreground">
                  User-generated content is not verified by us. Use information at your own discretion 
                  and verify important facts independently.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Legal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  Our liability is limited to the maximum extent permitted by law. 
                  We are not liable for indirect, incidental, or consequential damages.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Governing Law</h3>
                <p className="text-muted-foreground">
                  These terms are governed by the laws of the jurisdiction where our company is registered.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Changes to Terms</h3>
                <p className="text-muted-foreground">
                  We may update these terms periodically. Continued use of the service constitutes 
                  acceptance of updated terms.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Questions about these terms? Contact us at{' '}
                <a href="mailto:legal@localelore.com" className="text-primary hover:underline">
                  legal@localelore.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};