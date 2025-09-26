import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { Support } from '@/pages/Support';
import { ContentGuidelines } from '@/pages/ContentGuidelines';
import { HelpCircle, Shield, FileText, MessageCircle, BookOpen } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Help Center | Locale Lore</title>
        <meta name="description" content="Help center with privacy policy, terms of service, support, and content guidelines for Locale Lore." />
        <link rel="canonical" href="/help" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <HelpCircle className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Help Center</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find everything you need to know about using Locale Lore, our policies, and getting support.
            </p>
          </div>

          <Tabs defaultValue="support" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="support" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Support
              </TabsTrigger>
              <TabsTrigger value="guidelines" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Guidelines
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Terms
              </TabsTrigger>
            </TabsList>

            <TabsContent value="support">
              <Support />
            </TabsContent>

            <TabsContent value="guidelines">
              <ContentGuidelines />
            </TabsContent>

            <TabsContent value="privacy">
              <Privacy />
            </TabsContent>

            <TabsContent value="terms">
              <Terms />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Help;