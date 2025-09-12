import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Heart, 
  Users, 
  Globe,
  Camera,
  MapPin,
  MessageSquare,
  Flag,
  Scale
} from 'lucide-react';

export const ContentGuidelines = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Content Guidelines | Locale Lore</title>
        <meta name="description" content="Community guidelines and content policies for Locale Lore. Learn how to create quality content and maintain a positive community environment." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Shield className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Content Guidelines</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our community guidelines help ensure Locale Lore remains a welcoming, informative, and respectful platform for everyone to share and discover amazing places.
            </p>
          </div>

          {/* Community Values */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Our Community Values
              </CardTitle>
              <CardDescription>
                These core values guide everything we do at Locale Lore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Globe className="h-8 w-8 text-blue-500 mx-auto" />
                  <h3 className="font-semibold">Global Perspective</h3>
                  <p className="text-sm text-muted-foreground">
                    Celebrating diverse cultures, places, and stories from around the world
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 text-green-500 mx-auto" />
                  <h3 className="font-semibold">Respectful Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Fostering inclusive discussions and treating all members with dignity
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-purple-500 mx-auto" />
                  <h3 className="font-semibold">Quality Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Sharing accurate, valuable, and well-researched information
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Standards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Content Standards</h2>
            
            {/* Facts and Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Facts and Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Encouraged Content
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Historical facts and stories about places</li>
                      <li>• Cultural significance and traditions</li>
                      <li>• Architectural and natural features</li>
                      <li>• Local legends and folklore (clearly marked as such)</li>
                      <li>• Interesting trivia and lesser-known information</li>
                      <li>• Personal experiences and observations</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4" />
                      Prohibited Content
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• False or deliberately misleading information</li>
                      <li>• Content that promotes dangerous activities</li>
                      <li>• Private residences or personal information</li>
                      <li>• Copyrighted content without permission</li>
                      <li>• Commercial advertising or spam</li>
                      <li>• Content that violates local laws or customs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Media Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Good Practices
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• High-quality, clear images</li>
                      <li>• Original photos you took yourself</li>
                      <li>• Properly attributed public domain images</li>
                      <li>• Relevant to the location and fact</li>
                      <li>• Respectful of cultural sensitivities</li>
                      <li>• Include people only with consent</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4" />
                      Avoid
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Copyrighted images without permission</li>
                      <li>• Photos of people without consent</li>
                      <li>• Images containing personal information</li>
                      <li>• Poor quality or irrelevant photos</li>
                      <li>• Inappropriate or offensive content</li>
                      <li>• Images that violate privacy</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Interaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Community Interaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Comments and Discussions</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Comments should contribute meaningfully to the discussion and maintain a respectful tone.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                          Encouraged
                        </Badge>
                        <ul className="space-y-1 text-sm">
                          <li>• Constructive feedback and corrections</li>
                          <li>• Additional context and information</li>
                          <li>• Personal experiences related to the location</li>
                          <li>• Questions seeking clarification</li>
                          <li>• Appreciation and positive engagement</li>
                        </ul>
                      </div>
                      <div>
                        <Badge variant="outline" className="text-red-600 border-red-600 mb-2">
                          Prohibited
                        </Badge>
                        <ul className="space-y-1 text-sm">
                          <li>• Personal attacks or harassment</li>
                          <li>• Discriminatory or hateful language</li>
                          <li>• Off-topic discussions</li>
                          <li>• Spam or promotional content</li>
                          <li>• Trolling or deliberately inflammatory remarks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Process */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Verification Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Our community-driven verification system helps ensure content quality and accuracy.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How Verification Works</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Facts are submitted by community members</li>
                      <li>Other users review and vote on accuracy</li>
                      <li>Facts with sufficient positive votes become verified</li>
                      <li>Disputed facts are reviewed by moderators</li>
                      <li>Verified facts receive higher visibility</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Verification Guidelines</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Vote based on accuracy, not personal preference</li>
                      <li>• Provide sources when disputing information</li>
                      <li>• Be constructive in feedback</li>
                      <li>• Consider cultural context and perspectives</li>
                      <li>• Report facts that violate guidelines</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moderation and Reporting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Moderation and Reporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">When to Report Content</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Inappropriate, offensive, or harmful content</li>
                      <li>• Spam or commercial advertising</li>
                      <li>• False or misleading information</li>
                      <li>• Copyright violations</li>
                      <li>• Privacy violations</li>
                      <li>• Content that violates these guidelines</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Moderation Process</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Reports are reviewed by our moderation team</li>
                      <li>Content is evaluated against community guidelines</li>
                      <li>Appropriate action is taken (edit, remove, warn)</li>
                      <li>Users are notified of moderation decisions</li>
                      <li>Appeals can be submitted for review</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consequences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Consequences for Violations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We believe in fair and progressive enforcement of our guidelines.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Progressive Actions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm"><strong>Warning:</strong> First-time minor violations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm"><strong>Content Removal:</strong> Violation of content guidelines</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm"><strong>Temporary Suspension:</strong> Repeated violations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-700" />
                        <span className="text-sm"><strong>Permanent Ban:</strong> Serious or repeated violations</span>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Serious violations such as harassment, doxxing, or illegal content may result in immediate account suspension.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Best Practices for Quality Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Before Posting</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Research your facts thoroughly</li>
                      <li>• Check if similar content already exists</li>
                      <li>• Ensure accuracy and cite sources</li>
                      <li>• Consider cultural sensitivity</li>
                      <li>• Use clear, descriptive titles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">After Posting</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Engage respectfully with comments</li>
                      <li>• Address questions and feedback</li>
                      <li>• Update information if corrected</li>
                      <li>• Report inappropriate responses</li>
                      <li>• Thank community members for contributions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact and Support */}
            <Card>
              <CardHeader>
                <CardTitle>Questions or Concerns?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  If you have questions about these guidelines or need to report content, we're here to help.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">
                    📧 <strong>Email:</strong> community@localelore.com
                  </p>
                  <p className="text-sm">
                    💬 <strong>Support Center:</strong> <a href="/support" className="text-primary hover:underline">Submit a ticket</a>
                  </p>
                  <p className="text-sm">
                    🔄 <strong>Updates:</strong> These guidelines are reviewed regularly and may be updated
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t">
            <p className="text-sm text-muted-foreground">
              Last updated: September 2025 | Version 1.0<br />
              By using Locale Lore, you agree to follow these community guidelines.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};