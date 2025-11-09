import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SiteSettingsPanel: React.FC = () => {
  const { t } = useTranslation('admin');
  const { branding, isLoading, uploadLogo, uploadFavicon, isUploading, updateBranding } = useSiteSettings();

  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadLogo(acceptedFiles[0]);
    }
  }, [uploadLogo]);

  const onDropFavicon = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFavicon(acceptedFiles[0]);
    }
  }, [uploadFavicon]);

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const { getRootProps: getFaviconRootProps, getInputProps: getFaviconInputProps, isDragActive: isFaviconDragActive } = useDropzone({
    onDrop: onDropFavicon,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.ico', '.svg'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.trim()) {
      updateBranding({ site_name: newName });
    }
  };

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
        <h2 className="text-3xl font-bold text-foreground">Branding Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your site's logo, favicon, and brand identity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Site Logo</CardTitle>
            <CardDescription>Upload your site logo (PNG, JPG, SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branding?.logo_url && (
              <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/50">
                <img 
                  src={branding.logo_url} 
                  alt="Current logo" 
                  className="max-h-24 object-contain"
                />
              </div>
            )}
            
            <div
              {...getLogoRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isLogoDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getLogoInputProps()} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isLogoDragActive ? 'Drop logo here...' : 'Drag & drop logo or click to browse'}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Favicon Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Favicon</CardTitle>
            <CardDescription>Upload your site favicon (PNG, ICO, SVG)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branding?.favicon_url && (
              <div className="flex items-center justify-center p-4 border border-border rounded-lg bg-muted/50">
                <img 
                  src={branding.favicon_url} 
                  alt="Current favicon" 
                  className="h-8 w-8 object-contain"
                />
              </div>
            )}
            
            <div
              {...getFaviconRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isFaviconDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getFaviconInputProps()} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isFaviconDragActive ? 'Drop favicon here...' : 'Drag & drop favicon or click to browse'}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Site Name */}
        <Card>
          <CardHeader>
            <CardTitle>Site Name</CardTitle>
            <CardDescription>Your site's display name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name</Label>
              <Input
                id="site-name"
                defaultValue={branding?.site_name || 'LocaleLore'}
                onBlur={handleSiteNameChange}
                placeholder="Enter site name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>More configuration options available</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use the other tabs in the admin sidebar to configure:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Theme colors with live preview</li>
              <li>SEO meta tags and keywords</li>
              <li>Social media links</li>
              <li>Contact information</li>
              <li>Analytics tracking codes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
