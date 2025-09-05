import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Database, Cookie, Mail, Eye, MapPin } from 'lucide-react';

export const Privacy = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Privacy Policy | Locale Lore</title>
        <meta name="description" content="Learn how Locale Lore protects your privacy and handles your personal data." />
        <link rel="canonical" href={`${window.location.origin}/privacy`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <p className="text-muted-foreground">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-muted-foreground">
                  When you create an account, we collect your email address, name, and any profile information you provide.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Content and Activity</h3>
                <p className="text-muted-foreground">
                  We collect the content you create, share, or interact with, including stories, facts, votes, and comments.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Location Data</h3>
                <p className="text-muted-foreground">
                  With your permission, we collect location data to provide location-based discoveries and content.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Usage Analytics</h3>
                <p className="text-muted-foreground">
                  We collect anonymized usage data to improve our service. You can opt-out of analytics in your settings.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li>• Provide and improve our services</li>
                <li>• Personalize your experience and recommendations</li>
                <li>• Communicate with you about updates and features</li>
                <li>• Ensure security and prevent abuse</li>
                <li>• Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Location data is used only for location-based features like discovering nearby content. 
                We add noise to coordinates for privacy protection (±1km accuracy). You can disable 
                location sharing at any time in your privacy settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  Required for authentication and basic functionality.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground">
                  Optional cookies that help us understand usage patterns. You can opt-out via our cookie banner.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Access & Portability</h3>
                  <p className="text-muted-foreground text-sm">
                    Export your data anytime from your profile settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Rectification</h3>
                  <p className="text-muted-foreground text-sm">
                    Update your information in your account settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Erasure</h3>
                  <p className="text-muted-foreground text-sm">
                    Request account deletion from your profile settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Opt-out</h3>
                  <p className="text-muted-foreground text-sm">
                    Control tracking and marketing preferences in settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Questions about this privacy policy? Contact us at{' '}
                <a href="mailto:privacy@localelore.com" className="text-primary hover:underline">
                  privacy@localelore.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};