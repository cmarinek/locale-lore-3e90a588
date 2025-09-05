import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BuildStatus {
  id: string;
  platform: 'android' | 'ios';
  status: 'pending' | 'building' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
}

export const MobileAppBuilder: React.FC = () => {
  const { toast } = useToast();
  const [builds, setBuilds] = useState<BuildStatus[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);

  const startBuild = async (platform: 'android' | 'ios') => {
    const buildId = `build_${Date.now()}_${platform}`;
    
    const newBuild: BuildStatus = {
      id: buildId,
      platform,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    setBuilds(prev => [newBuild, ...prev]);
    setIsBuilding(true);

    try {
      // Simulate build process - in production this would call Supabase Edge Function
      const response = await fetch('/api/build-mobile-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          platform,
          buildId,
          // Add configuration options here
          appName: 'LocaleLore',
          bundleId: 'app.lovable.8ee9bb219cd64b2281a4e2322ff21c98'
        })
      });

      if (!response.ok) {
        throw new Error(`Build failed: ${response.statusText}`);
      }

      // Update build status
      setBuilds(prev => prev.map(build => 
        build.id === buildId 
          ? { ...build, status: 'building', progress: 10 }
          : build
      ));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setBuilds(prev => prev.map(build => {
          if (build.id === buildId && build.status === 'building') {
            const newProgress = Math.min(build.progress + 15, 90);
            return { ...build, progress: newProgress };
          }
          return build;
        }));
      }, 2000);

      // Simulate completion after 15 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        setBuilds(prev => prev.map(build => 
          build.id === buildId 
            ? { 
                ...build, 
                status: 'completed', 
                progress: 100,
                downloadUrl: `/downloads/${buildId}.${platform === 'android' ? 'apk' : 'ipa'}`
              }
            : build
        ));
        setIsBuilding(false);
        
        toast({
          title: "Build Complete",
          description: `${platform === 'android' ? 'Android APK' : 'iOS IPA'} is ready for download.`,
        });
      }, 15000);

    } catch (error) {
      setBuilds(prev => prev.map(build => 
        build.id === buildId 
          ? { 
              ...build, 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : build
      ));
      setIsBuilding(false);
      
      toast({
        title: "Build Failed",
        description: `Failed to build ${platform} app. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const downloadBuild = (build: BuildStatus) => {
    if (build.downloadUrl) {
      // In production, this would download from secure storage
      const link = document.createElement('a');
      link.href = build.downloadUrl;
      link.download = `LocaleLore_${build.platform}_${build.id}.${build.platform === 'android' ? 'apk' : 'ipa'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${build.platform === 'android' ? 'Android APK' : 'iOS IPA'} file.`,
      });
    }
  };

  const getStatusIcon = (status: BuildStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'building':
        return <Building className="w-4 h-4 text-primary animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: BuildStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'building':
        return <Badge variant="outline" className="text-primary border-primary">Building</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-success text-success-foreground">Complete</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Mobile App Builder</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Build and distribute mobile applications for Android and iOS
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Building mobile apps requires proper signing certificates and can take 10-20 minutes. 
              iOS builds require Apple Developer certificates.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Android APK</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build APK file for Google Play Store distribution
                </p>
                <Button 
                  onClick={() => startBuild('android')}
                  disabled={isBuilding}
                  className="w-full"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Build Android APK
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-700" />
                  <h3 className="font-semibold">iOS IPA</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Build IPA file for Apple App Store distribution
                </p>
                <Button 
                  onClick={() => startBuild('ios')}
                  disabled={isBuilding}
                  className="w-full"
                  variant="outline"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Build iOS IPA
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {builds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Build History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {builds.map((build) => (
                <div key={build.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-5 h-5 ${build.platform === 'android' ? 'text-green-600' : 'text-gray-700'}`} />
                      <div>
                        <h4 className="font-semibold">
                          {build.platform === 'android' ? 'Android APK' : 'iOS IPA'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {build.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(build.status)}
                      {getStatusBadge(build.status)}
                    </div>
                  </div>

                  {build.status === 'building' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Building...</span>
                        <span>{build.progress}%</span>
                      </div>
                      <Progress value={build.progress} className="w-full" />
                    </div>
                  )}

                  {build.status === 'failed' && build.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{build.error}</AlertDescription>
                    </Alert>
                  )}

                  {build.status === 'completed' && build.downloadUrl && (
                    <Button 
                      onClick={() => downloadBuild(build)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {build.platform === 'android' ? 'APK' : 'IPA'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};