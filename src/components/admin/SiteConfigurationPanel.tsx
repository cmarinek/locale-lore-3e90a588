import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteConfiguration } from '@/hooks/useSiteConfiguration';
import { FileText, Share2, Phone, BarChart3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SiteConfigurationPanel: React.FC = () => {
  const { t } = useTranslation('admin');
  const { seoConfig, socialConfig, contactConfig, analyticsConfig, isLoading, updateConfig } = useSiteConfiguration();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Site Configuration</h2>
        <p className="text-muted-foreground mt-2">
          Manage SEO, social media, contact information, and analytics
        </p>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Configure meta tags and search engine optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  defaultValue={seoConfig?.meta_title}
                  onBlur={(e) => updateConfig({ 
                    key: 'seo', 
                    value: { ...seoConfig, meta_title: e.target.value } 
                  })}
                  placeholder="LocaleLore - Discover Local Stories"
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  defaultValue={seoConfig?.meta_description}
                  onBlur={(e) => updateConfig({ 
                    key: 'seo', 
                    value: { ...seoConfig, meta_description: e.target.value } 
                  })}
                  placeholder="Discover fascinating local stories, culture, and hidden gems..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  defaultValue={seoConfig?.meta_keywords}
                  onBlur={(e) => updateConfig({ 
                    key: 'seo', 
                    value: { ...seoConfig, meta_keywords: e.target.value } 
                  })}
                  placeholder="local stories, culture, travel"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Configure your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  defaultValue={socialConfig?.facebook}
                  onBlur={(e) => updateConfig({ 
                    key: 'social', 
                    value: { ...socialConfig, facebook: e.target.value } 
                  })}
                  placeholder="https://facebook.com/yourbrand"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter / X</Label>
                <Input
                  id="twitter"
                  defaultValue={socialConfig?.twitter}
                  onBlur={(e) => updateConfig({ 
                    key: 'social', 
                    value: { ...socialConfig, twitter: e.target.value } 
                  })}
                  placeholder="https://twitter.com/yourbrand"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  defaultValue={socialConfig?.instagram}
                  onBlur={(e) => updateConfig({ 
                    key: 'social', 
                    value: { ...socialConfig, instagram: e.target.value } 
                  })}
                  placeholder="https://instagram.com/yourbrand"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  defaultValue={socialConfig?.linkedin}
                  onBlur={(e) => updateConfig({ 
                    key: 'social', 
                    value: { ...socialConfig, linkedin: e.target.value } 
                  })}
                  placeholder="https://linkedin.com/company/yourbrand"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Configure your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={contactConfig?.email}
                  onBlur={(e) => updateConfig({ 
                    key: 'contact', 
                    value: { ...contactConfig, email: e.target.value } 
                  })}
                  placeholder="contact@localelore.app"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  defaultValue={contactConfig?.phone}
                  onBlur={(e) => updateConfig({ 
                    key: 'contact', 
                    value: { ...contactConfig, phone: e.target.value } 
                  })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  defaultValue={contactConfig?.address}
                  onBlur={(e) => updateConfig({ 
                    key: 'contact', 
                    value: { ...contactConfig, address: e.target.value } 
                  })}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking</CardTitle>
              <CardDescription>Configure analytics tracking codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  defaultValue={analyticsConfig?.google_analytics_id}
                  onBlur={(e) => updateConfig({ 
                    key: 'analytics', 
                    value: { ...analyticsConfig, google_analytics_id: e.target.value } 
                  })}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  defaultValue={analyticsConfig?.facebook_pixel_id}
                  onBlur={(e) => updateConfig({ 
                    key: 'analytics', 
                    value: { ...analyticsConfig, facebook_pixel_id: e.target.value } 
                  })}
                  placeholder="XXXXXXXXXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="plausible_domain">Plausible Analytics Domain</Label>
                <Input
                  id="plausible_domain"
                  defaultValue={analyticsConfig?.plausible_domain}
                  onBlur={(e) => updateConfig({ 
                    key: 'analytics', 
                    value: { ...analyticsConfig, plausible_domain: e.target.value } 
                  })}
                  placeholder="localelore.app"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
